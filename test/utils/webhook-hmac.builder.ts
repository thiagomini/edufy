import type { INestApplication } from '@nestjs/common';
import webhookConfig, {
  WebhookConfig,
} from '@src/libs/configuration/webhook.config';
import { createHmac } from 'crypto';

export class WebhookHMACBuilder {
  constructor(private readonly secret: string) {}

  buildForPayload(payload: Record<string, any>) {
    const payloadString = this.serialize(payload);
    const hmac = createHmac('sha256', this.secret)
      .update(payloadString)
      .digest('hex');
    return hmac;
  }

  buildFromRawBody(rawBody: Buffer) {
    const unixTimestamp = Math.floor(Date.now() / 1000);
    const payloadString = this.serialize(rawBody);
    const header = `${unixTimestamp}.${payloadString}`;
    const hmac = createHmac('sha256', this.secret).update(header).digest('hex');
    return `t=${unixTimestamp},v1=${hmac}`;
  }

  public static for(app: INestApplication) {
    return new WebhookHMACBuilder(
      app.get<WebhookConfig>(webhookConfig.KEY).secret,
    );
  }

  private serialize(payload: Record<string, unknown> | Buffer) {
    if (Buffer.isBuffer(payload)) {
      return payload.toString();
    } else {
      return JSON.stringify(payload);
    }
  }
}
