import { registerAs } from '@nestjs/config';
import z from 'zod';

const adminConfigSchema = z.object({
  key: z.string().min(1, 'Admin key is required'),
});

export default registerAs('admin', () =>
  adminConfigSchema.parse({
    key: process.env.ADMIN_KEY,
  }),
);

export type AdminConfig = z.infer<typeof adminConfigSchema>;
