import { Body, Post } from '@nestjs/common';
import { Webhook } from '../webhook.decorator';

export const SECRET_KEY = 'SECRET_KEY';
export const HMAC_HEADER = 'hmac-header';

@Webhook('test', {
  secretKey: SECRET_KEY,
  HMACHeader: HMAC_HEADER,
})
export class WebhookTestController {
  @Post('events')
  createEvent(@Body() event: any) {
    return event;
  }
}
