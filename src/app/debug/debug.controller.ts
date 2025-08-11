import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { WebhookHMACBuilder } from '@src/libs/webhook/webhook-hmac.builder';
import { Public } from '../user/presentation/public.decorator';

@Public()
@Controller('debug')
export class DebugController {
  constructor(private readonly webhookHmacBuilder: WebhookHMACBuilder) {}

  @HttpCode(HttpStatus.OK)
  @Post('hmac')
  async createHmacForPayload(@Body() payload: Record<string, any>) {
    const hmac = this.webhookHmacBuilder.buildForPayload(payload);
    return { hmac };
  }
}
