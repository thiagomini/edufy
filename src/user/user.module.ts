import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig, { JwtConfig } from '../configuration/jwt.config';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (config: JwtConfig) => ({
        global: true,
        secret: config.secret,
        signOptions: { expiresIn: config.expiration },
      }),
      inject: [jwtConfig.KEY],
    }),
  ],
  controllers: [UserController],
})
export class UserModule {}
