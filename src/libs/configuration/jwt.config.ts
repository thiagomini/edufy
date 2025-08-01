import { registerAs } from '@nestjs/config';
import z from 'zod';

const jwtConfigSchema = z.object({
  secret: z.string().min(1, 'JWT secret is required'),
  expiration: z.string().min(1, 'JWT expiration is required').default('1h'),
});

export default registerAs('jwt', () =>
  jwtConfigSchema.parse({
    secret: process.env.JWT_SECRET,
    expiration: process.env.JWT_EXPIRATION,
  }),
);

export type JwtConfig = z.infer<typeof jwtConfigSchema>;
