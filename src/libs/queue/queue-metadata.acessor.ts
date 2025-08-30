/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { Injectable, Type } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { QueueEvent } from './queue-event-listener';
import {
  PROCESSOR_OPTIONS,
  ProcessorOptions,
  QUEUE_EVENT,
  QUEUE_EVENT_LISTENER,
} from './queue.decorators';

@Injectable()
export class QueueMetadataAccessor {
  constructor(private readonly reflector: Reflector) {}

  public isProcessor(target?: Type): boolean {
    if (!target) {
      return false;
    }

    const processorOptions = this.reflector.get(PROCESSOR_OPTIONS, target);
    return !!processorOptions;
  }

  public getProcessorOptions(
    target: Type | Function,
  ): ProcessorOptions | undefined {
    return this.reflector.get(PROCESSOR_OPTIONS, target);
  }

  public isQueueEventListener(target?: Type | Function): boolean {
    if (!target) {
      return false;
    }
    return !!this.reflector.get(QUEUE_EVENT_LISTENER, target);
  }

  public getQueueEventName(target: Type | Function): QueueEvent | undefined {
    return this.reflector.get(QUEUE_EVENT, target);
  }
}
