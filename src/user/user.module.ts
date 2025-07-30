import { Module } from '@nestjs/common';
import { ConfiguredJwtModule } from '@src/jwt/jwt.module';
import { InMemoryUserRepository } from './data/in-memory.user.repository';
import { JwtGuard } from './presentation/jwt.guard';
import { UserController } from './presentation/user.controller';
import { UserRepository } from './domain/user.repository';
import { APP_GUARD } from '@nestjs/core';
import { UserService } from './application/user.service';

@Module({
  imports: [ConfiguredJwtModule],
  controllers: [UserController],
  providers: [
    {
      provide: UserRepository,
      useClass: InMemoryUserRepository,
    },
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    UserService,
  ],
  exports: [UserRepository, UserService],
})
export class UserModule {}
