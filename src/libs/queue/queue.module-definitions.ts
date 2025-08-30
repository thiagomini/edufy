import { ConfigurableModuleBuilder } from '@nestjs/common';
import type { QueueModuleOptions } from './queue-module-options';

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<QueueModuleOptions>()
  .setClassMethodName('forRoot')
  .build();
