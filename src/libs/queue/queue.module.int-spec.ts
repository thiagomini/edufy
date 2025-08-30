import { Injectable } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';

import * as PgBoss from 'pg-boss';

import { QueueModule } from './queue.module';

import { JobWorker } from './job-worker';
import { PgBossQueue } from './pgboss-queue';
import { PG_BOSS_INSTANCE } from './providers';
import { OnQueueWipEventHandler } from './queue-event-listener';
import {
  getQueueToken,
  InjectQueue,
  OnQueueEvent,
  Processor,
  QueueEventsListener,
} from './queue.decorators';
import type { Queue } from './queue.interface';
import databaseConfig, {
  DatabaseConfig,
} from '../configuration/database.config';
import { waitFor } from '@test/utils/wait-for';
import { DatabaseModule } from '../database/database.module';
import { ConfigurationModule } from '../configuration/configuration.module';

describe('Queue Module', () => {
  let testingModule: TestingModule;
  let pgBoss: PgBoss;

  @Injectable()
  class TestService {
    constructor(@InjectQueue('test-queue') public readonly queue: Queue) {}
  }

  @Injectable()
  class JobService {
    public getJobData(job: PgBoss.Job) {
      return job.data;
    }
  }

  @Processor('test-queue')
  class TestConsumer extends JobWorker {
    constructor(private readonly jobService: JobService) {
      super();
    }
    process(job: PgBoss.Job) {
      return Promise.resolve(this.jobService.getJobData(job));
    }
  }

  @QueueEventsListener('test-queue')
  class TestEventListener implements OnQueueWipEventHandler {
    public workerNames: string[] = [];

    @OnQueueEvent('wip')
    onWip(workers: PgBoss.Worker[]) {
      this.workerNames = workers.map((worker) => worker.name);
    }
  }

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      imports: [
        ConfigurationModule,
        DatabaseModule,
        QueueModule.forRootAsync({
          imports: [ConfigModule.forFeature(databaseConfig)],
          inject: [databaseConfig.KEY],
          useFactory: (config: DatabaseConfig) => {
            return {
              connectionString: config.url,
            };
          },
        }),
        QueueModule.registerQueue('test-queue'),
      ],
      providers: [TestService, TestConsumer, TestEventListener, JobService],
    }).compile();

    await testingModule.init();
    pgBoss = testingModule.get(PG_BOSS_INSTANCE);
  });

  beforeEach(async () => {
    await pgBoss.clearStorage();
  });

  afterAll(async () => {
    await pgBoss.clearStorage();
    await pgBoss.deleteQueue('test-queue');
    await testingModule.close();
  });

  test('registers an instance of PgBoss', () => {
    expect(pgBoss).toBeInstanceOf(PgBoss);
  });

  test('starts a connection to the database', async () => {
    const isConnected = await pgBoss.isInstalled();

    expect(isConnected).toBe(true);
  });

  test('registers a queue', async () => {
    const queue = testingModule.get<Queue>(getQueueToken('test-queue'));
    const queueFromDb = await pgBoss.getQueue('test-queue');

    expect(queue).toBeDefined();
    expect(queue.name).toBe('test-queue');
    expect(queue).toBeInstanceOf(PgBossQueue);
    expect(queueFromDb).toBeTruthy();
    expect(queueFromDb?.name).toBe('test-queue');
  });

  test('injects a queue in a provider', () => {
    const testService = testingModule.get(TestService);
    expect(testService.queue).toBeTruthy();
    expect(testService.queue.name).toBe('test-queue');
  });

  test('provides a decorator to process jobs in a queue', async () => {
    const testService = testingModule.get(TestService);
    const consumer = testingModule.get(TestConsumer);
    const spy = jest.spyOn(consumer, 'process');

    await testService.queue.addJob({ test: 'data' });

    await waitFor(
      () => {
        expect(spy).toHaveReturnedWith(Promise.resolve({ test: 'data' }));
      },
      {
        timeout: 3000,
      },
    );
  });

  test('provides a decorator to listen to queue events', async () => {
    const testService = testingModule.get(TestService);
    const eventListener = testingModule.get(TestEventListener);

    await testService.queue.addJob({ test: 'data' });

    await waitFor(() => {
      expect(eventListener.workerNames).toEqual(['test-queue']);
    });
  });
});
