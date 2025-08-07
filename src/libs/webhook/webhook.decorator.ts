import {
  Controller,
  SetMetadata,
  UseGuards,
  applyDecorators,
} from '@nestjs/common';
import { WebHookGuard } from './webhook.guard';
import { Public } from '@src/app/user/presentation/public.decorator';

export const WEBHOOK_CONFIG = Symbol.for('webhook-config');

export type WebhookConfig = {
  secret: string;
  hmacHeader: string;
};

/**
 * Defines a class as a webhook controller protected by the WebHookGuard.
 * @param path The base path for the controller.
 */
export function Webhook(path: string, config?: WebhookConfig) {
  return applyDecorators(
    Controller(path ?? ''),
    UseGuards(WebHookGuard),
    Public(),
    SetMetadata(WEBHOOK_CONFIG, config),
  );
}
