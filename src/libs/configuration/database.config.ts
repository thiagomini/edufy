import { registerAs } from '@nestjs/config';
import z from 'zod';

const databaseConfigSchema = z.object({
  url: z.url(),
});

export default registerAs('database', () =>
  databaseConfigSchema.parse({
    url: process.env.DATABASE_URL,
  }),
);

export type DatabaseConfig = z.infer<typeof databaseConfigSchema>;
