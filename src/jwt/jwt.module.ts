import { JwtModule } from '@nestjs/jwt';
import jwtConfig, { JwtConfig } from '../configuration/jwt.config';

export const ConfiguredJwtModule = JwtModule.registerAsync({
  useFactory: (config: JwtConfig) => ({
    global: true,
    secret: config.secret,
    signOptions: { expiresIn: config.expiration },
  }),
  inject: [jwtConfig.KEY],
});
