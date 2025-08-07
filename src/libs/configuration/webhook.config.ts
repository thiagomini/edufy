import { registerAs } from '@nestjs/config';
import z from 'zod';

const webhookConfigSchema = z.object({
  secret: z.string().min(1, 'webhook secret is required'),
  hmacHeader: z.string().min(1, 'HMAC header is required'),
});

export default registerAs('webhook', () =>
  webhookConfigSchema.parse({
    secret: process.env.WEBHOOK_SECRET,
    hmacHeader: process.env.WEBHOOK_HMAC_HEADER,
  }),
);

export type WebhookConfig = z.infer<typeof webhookConfigSchema>;
