import { Body, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Webhook } from '@src/libs/webhook/webhook.decorator';
import { WebhookEventDto } from '@src/libs/webhook/webhook.event';

@Webhook('/payments/webhook')
export class PaymentsWebhook {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('')
  async handlePaymentsWebhook(@Body() event: WebhookEventDto) {
    await this.eventEmitter.emitAsync(event.type, event);
  }
}
