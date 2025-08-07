import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  RawBodyRequest,
} from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { createHmac, timingSafeEqual } from 'crypto';
import { WEBHOOK_CONFIG, WebhookConfig } from './webhook.decorator';
import webhookConfig from '../configuration/webhook.config';

@Injectable()
export class WebHookGuard implements CanActivate {
  private readonly logger = new Logger(WebHookGuard.name);

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request: RawBodyRequest<Request> = context
      .switchToHttp()
      .getRequest();
    const hmacHeader = request.headers[
      this.getWebhookHeaderName(context)
    ] as string;
    if (!hmacHeader) {
      throw new ForbiddenException('HMAC header is missing');
    }

    const body = request.rawBody?.toString();
    const hmac = createHmac('sha256', this.getWebhookSecret(context))
      .update(body as string)
      .digest('hex');

    const signature = hmacHeader;

    const isVerified = timingSafeEqual(
      Buffer.from(hmac),
      Buffer.from(signature),
    );

    if (!isVerified) {
      const classAndMethod =
        context.getClass().name + '.' + context.getHandler().name;
      this.logger.warn(
        `Invalid HMAC signature for webhook ${classAndMethod}: ${hmac}`,
      );
      throw new ForbiddenException('Invalid HMAC signature');
    }

    return true;
  }

  private getWebhookSecret(context: ExecutionContext): string {
    const secret = this.getWebhookConfig(context).secret;
    return secret;
  }

  private getWebhookHeaderName(context: ExecutionContext): string {
    const header = this.getWebhookConfig(context).hmacHeader;
    return header;
  }

  private getWebhookConfig(context: ExecutionContext): WebhookConfig {
    const webHookConfigFromMetadata =
      this.reflector.getAllAndOverride<WebhookConfig>(WEBHOOK_CONFIG, [
        context.getHandler(),
        context.getClass(),
      ]);
    if (webHookConfigFromMetadata) {
      return webHookConfigFromMetadata;
    }
    const webHookConfigFromEnv = this.moduleRef.get<WebhookConfig>(
      webhookConfig.KEY,
      {
        strict: false,
      },
    );
    return webHookConfigFromEnv;
  }
}
