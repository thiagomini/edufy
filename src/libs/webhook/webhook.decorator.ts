import {
  Controller,
  SetMetadata,
  UseGuards,
  applyDecorators,
} from '@nestjs/common';
import { WebHookGuard } from './webhook.guard';

export const WEBHOOK_CONFIG = Symbol.for('webhook-config');

export type WebhookConfig = {
  secretKey: string;
  HMACHeader: string;
};

/**
 * Defines a class as a webhook controller protected by the WebHookGuard.
 * @param path The base path for the controller.
 */
export function Webhook(path: string, config: WebhookConfig) {
  return applyDecorators(
    Controller(path ?? ''),
    UseGuards(WebHookGuard),
    SetMetadata(WEBHOOK_CONFIG, config),
  );
}
