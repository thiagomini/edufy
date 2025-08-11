import { Module } from '@nestjs/common';
import { WebHookGuard } from './webhook.guard';
import { WebhookHMACBuilder } from './webhook-hmac.builder';

@Module({
  providers: [WebHookGuard, WebhookHMACBuilder],
  exports: [WebHookGuard, WebhookHMACBuilder],
})
export class WebhookModule {}
