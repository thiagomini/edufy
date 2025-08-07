import { Body, Post } from '@nestjs/common';
import { Webhook } from '../webhook.decorator';

export const SECRET_KEY = 'SECRET_KEY';
export const HMAC_HEADER = 'hmac-header';

@Webhook('test', {
  secret: SECRET_KEY,
  hmacHeader: HMAC_HEADER,
})
export class WebhookTestController {
  @Post('events')
  createEvent(@Body() event: any) {
    return event;
  }
}
