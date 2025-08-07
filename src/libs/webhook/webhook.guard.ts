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
      throw new ForbiddenException();
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
      throw new ForbiddenException();
    }

    return true;
  }

  private getWebhookSecret(context: ExecutionContext): string {
    const config = this.getWebhookConfig(context);
    const secretValue = this.moduleRef.get(config.secretKey, { strict: false });
    return secretValue.webhookSecret;
  }

  private getWebhookHeaderName(context: ExecutionContext): string {
    const config = this.getWebhookConfig(context);
    return config.HMACHeader;
  }

  private getWebhookConfig(context: ExecutionContext): WebhookConfig {
    return this.reflector.getAllAndOverride<WebhookConfig>(WEBHOOK_CONFIG, [
      context.getHandler(),
      context.getClass(),
    ]);
  }
}
