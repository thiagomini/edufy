import * as assert from 'node:assert';
import {
  DynamicModule,
  Inject,
  Logger,
  Module,
  OnModuleDestroy,
  OnModuleInit,
  Provider,
  Type,
} from '@nestjs/common';
import {
  DiscoveryModule,
  DiscoveryService,
  MetadataScanner,
  ModuleRef,
} from '@nestjs/core';
import * as PgBoss from 'pg-boss';
import { QueueModuleOptions } from './queue-module-options';
import {
  ASYNC_OPTIONS_TYPE,
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
} from './queue.module-definitions';

import { JobWorker } from './job-worker';
import { PgBossQueue } from './pgboss-queue';
import { PG_BOSS_INSTANCE } from './providers';
import { QueueMetadataAccessor } from './queue-metadata.acessor';
import { getQueueToken } from './queue.decorators';

@Module({
  imports: [DiscoveryModule],
  providers: [QueueMetadataAccessor],
})
export class QueueModule
  extends ConfigurableModuleClass
  implements OnModuleInit, OnModuleDestroy
{
  private static readonly queues: Map<string, PgBoss.Queue> = new Map();
  private readonly logger = new Logger(QueueModule.name);
  constructor(
    @Inject(PG_BOSS_INSTANCE)
    private readonly pgBoss: PgBoss,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataAccessor: QueueMetadataAccessor,
    private readonly metadataScanner: MetadataScanner,
    private readonly moduleRef: ModuleRef,
  ) {
    super();
  }

  static forRoot(options: QueueModuleOptions): DynamicModule {
    const module = super.forRoot(options);

    const pgBossProvider: Provider = {
      provide: PG_BOSS_INSTANCE,
      useValue: new PgBoss(options),
    };

    return {
      ...module,
      providers: [...(module.providers || []), pgBossProvider],
      exports: [...(module.exports || []), pgBossProvider],
      global: true,
    };
  }

  static forRootAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    const module = super.forRootAsync(options);

    const pgBossProvider: Provider = {
      provide: PG_BOSS_INSTANCE,
      useFactory: (queueOptions: QueueModuleOptions) => {
        return new PgBoss(queueOptions);
      },
      inject: [MODULE_OPTIONS_TOKEN],
    };

    return {
      ...module,
      providers: [...(module.providers || []), pgBossProvider],
      exports: [...(module.exports || []), pgBossProvider],
      global: true,
    };
  }

  async onModuleInit() {
    this.logger.debug('Initializing PgBoss...');
    await this.createQueues();
    await this.pgBoss.start();
    await this.setupProcessors();
    this.setupEventListeners();
    this.pgBoss.on('error', (error: Error) => {
      this.logger.error('PgBoss error:', error);
    });
  }

  private async createQueues() {
    for (const [queueName, options] of QueueModule.queues.entries()) {
      await this.pgBoss.createQueue(queueName, options);
      this.logger.debug(`Queue Created: ${queueName}`);
    }
  }

  private async setupProcessors() {
    this.logger.debug('Setting up processors...');
    const processorWrappers = this.discoveryService
      .getProviders()
      .filter((wrapper) => {
        const metatype: Type =
          !wrapper.metatype || wrapper.inject
            ? wrapper.instance?.constructor
            : wrapper.metatype;

        return this.metadataAccessor.isProcessor(metatype);
      });

    for (const wrapper of processorWrappers) {
      const { instance, metatype } = wrapper;
      assert(instance, 'Processor instance must be defined');
      assert(metatype, 'Processor "class" must be defined');

      this.logger.debug(`Setting up processor for class: ${metatype.name}`);

      const processorOptions =
        this.metadataAccessor.getProcessorOptions(metatype);
      assert(processorOptions, 'Processor options must be defined');

      const { name: queueName } = processorOptions;
      const isRequestScoped = !wrapper.isDependencyTreeStatic();

      if (instance instanceof JobWorker) {
        if (isRequestScoped) {
          // For request-scoped processors, create a new instance for each job
          const workerId = await this.pgBoss.work(queueName, async ([job]) => {
            assert(job);
            this.logger.debug(
              `Processing job for request-scoped queue: ${queueName}`,
            );

            // Create a new request-scoped instance with fresh dependencies
            const requestScopedInstance = await this.moduleRef.resolve(
              metatype,
              undefined,
              { strict: false },
            );

            if (!(requestScopedInstance instanceof JobWorker)) {
              throw new Error(
                `Request-scoped processor ${metatype.name} must extend JobWorker class to process jobs.`,
              );
            }

            return await requestScopedInstance.process(job);
          });

          this.logger.debug(
            `Mapped Request-Scoped Processor ${metatype.name}(id=${workerId}) for queue "${queueName}"`,
          );
        } else {
          // Regular scoped processors
          const workerId = await this.pgBoss.work(queueName, async ([job]) => {
            assert(job);
            this.logger.debug(`Processing jobs for queue: ${queueName}`);

            return await instance.process(job);
          });
          this.logger.debug(
            `Mapped Processor ${instance.constructor.name}(id=${workerId}) for queue "${queueName}"`,
          );
        }
      } else {
        throw new Error(
          `Processor ${metatype.name} must extend JobWorker class to process jobs.`,
        );
      }
    }
  }

  private setupEventListeners() {
    this.logger.debug('Setting up event listeners...');
    const eventListenerWrappers = this.discoveryService
      .getProviders()
      .filter((wrapper) => {
        const metatype: Type =
          !wrapper.metatype || wrapper.inject
            ? wrapper.instance?.constructor
            : wrapper.metatype;

        return this.metadataAccessor.isQueueEventListener(metatype);
      });

    for (const wrapper of eventListenerWrappers) {
      const { instance, metatype } = wrapper;
      assert(instance, 'Event listener instance must be defined');
      assert(metatype, 'Event listener "class" must be defined');

      const methodNames = this.metadataScanner.getAllMethodNames(
        instance as object,
      );

      for (const methodName of methodNames) {
        const eventName = this.metadataAccessor.getQueueEventName(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
          instance[methodName] as Function,
        );

        if (eventName) {
          // Type casting below is only a workaround for TypeScript's type system - it's not handling only the "error" event.
          this.pgBoss.on(eventName as 'error', (...args: any[]) => {
            instance[methodName](...args);
          });
        }
      }
    }
  }

  async onModuleDestroy() {
    this.logger.debug('Shutting down PgBoss...');
    await this.pgBoss.stop();
  }

  static registerQueue(
    queueName: string,
    options?: PgBoss.Queue,
  ): DynamicModule {
    const queueProvider: Provider = {
      provide: getQueueToken(queueName),
      useFactory: (boss: PgBoss) => {
        return new PgBossQueue(boss, queueName);
      },
      inject: [PG_BOSS_INSTANCE],
    };

    this.queues.set(queueName, {
      name: queueName,
      ...options,
    });

    return {
      module: QueueModule,
      providers: [queueProvider],
      exports: [queueProvider],
    };
  }
}
