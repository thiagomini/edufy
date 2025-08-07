import { Module } from '@nestjs/common';
import { WebHookGuard } from './webhook.guard';

@Module({
  providers: [WebHookGuard],
  exports: [WebHookGuard],
})
export class WebhookModule {}
