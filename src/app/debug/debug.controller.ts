import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { WebhookHMACBuilder } from '@src/libs/webhook/webhook-hmac.builder';
import { Public } from '../user/presentation/public.decorator';

@Public()
@Controller('debug')
export class DebugController {
  constructor(private readonly webhookHmacBuilder: WebhookHMACBuilder) {}

  @HttpCode(HttpStatus.OK)
  @Post('hmac')
  async createHmacForPayload(@Req() request: RawBodyRequest<Request>) {
    const hmac = this.webhookHmacBuilder.buildForPayload(request.rawBody);
    return { hmac };
  }
}
