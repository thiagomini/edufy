import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { WebhookModule } from '@src/libs/webhook/webhook.module';
import { DebugController } from './debug.controller';

@Module({
  imports: [WebhookModule],
  controllers: [DebugController],
})
export class DebugModule implements OnModuleInit {
  private readonly logger = new Logger(DebugModule.name);
  onModuleInit() {
    this.logger.warn('Debugger Module Enabled!');
  }
}
