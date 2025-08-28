import { Inject, SetMetadata, type Scope } from '@nestjs/common';

export const PROCESSOR_OPTIONS = 'PROCESSOR_OPTIONS';
export const QUEUE_EVENT_LISTENER = 'QUEUE_EVENT_LISTENER';
export const QUEUE_EVENT = 'QUEUE_EVENT';

export const getQueueToken = (queueName: string) => {
  return `PgBossQueue_${queueName}` as const;
};

export function InjectQueue(name: string): ParameterDecorator {
  return Inject(getQueueToken(name));
}

export interface ProcessorOptions {
  name: string;
  scope?: Scope;
}

export function Processor(
  nameOrOptions: string | ProcessorOptions,
): ClassDecorator {
  const options =
    typeof nameOrOptions === 'string' ? { name: nameOrOptions } : nameOrOptions;

  return SetMetadata(PROCESSOR_OPTIONS, options);
}

export function QueueEventsListener(queueName: string): ClassDecorator {
  return SetMetadata(QUEUE_EVENT_LISTENER, queueName);
}

export function OnQueueEvent(
  event: 'error' | 'wip' | 'stopped' | 'monitor-states',
): MethodDecorator {
  return SetMetadata(QUEUE_EVENT, event);
}
