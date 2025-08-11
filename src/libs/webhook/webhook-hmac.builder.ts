import { Inject, Injectable } from '@nestjs/common';
import webhookConfig, {
  WebhookConfig,
} from '@src/libs/configuration/webhook.config';
import { createHmac } from 'crypto';

@Injectable()
export class WebhookHMACBuilder {
  constructor(
    @Inject(webhookConfig.KEY)
    private readonly webhookConfig: WebhookConfig,
  ) {}

  buildForPayload(payload: Record<string, any>) {
    const payloadString = this.serialize(payload);
    const hmac = createHmac('sha256', this.webhookConfig.secret)
      .update(payloadString)
      .digest('hex');
    return hmac;
  }

  buildFromRawBody(rawBody: Buffer) {
    const unixTimestamp = Math.floor(Date.now() / 1000);
    const payloadString = this.serialize(rawBody);
    const header = `${unixTimestamp}.${payloadString}`;
    const hmac = createHmac('sha256', this.webhookConfig.secret)
      .update(header)
      .digest('hex');
    return `t=${unixTimestamp},v1=${hmac}`;
  }

  private serialize(payload: Record<string, unknown> | Buffer) {
    if (Buffer.isBuffer(payload)) {
      return payload.toString();
    } else {
      return JSON.stringify(payload);
    }
  }
}
