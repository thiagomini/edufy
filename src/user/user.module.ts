import { Module } from '@nestjs/common';
import { ConfiguredJwtModule } from '../jwt/jwt.module';
import { InMemoryUserRepository } from './in-memory.user.repository';
import { JwtGuard } from './jwt.guard';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';

@Module({
  imports: [ConfiguredJwtModule],
  controllers: [UserController],
  providers: [
    {
      provide: UserRepository,
      useClass: InMemoryUserRepository,
    },
    JwtGuard,
  ],
  exports: [UserRepository],
})
export class UserModule {}
