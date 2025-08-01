import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfiguredJwtModule } from '@src/libs/jwt/jwt.module';
import { UserService } from './application/user.service';
import { KyselyUserRepository } from './data/kysely.user.repository';
import { UserRepository } from './domain/user.repository';
import { JwtGuard } from './presentation/jwt.guard';
import { UserController } from './presentation/user.controller';

@Module({
  imports: [ConfiguredJwtModule],
  controllers: [UserController],
  providers: [
    {
      provide: UserRepository,
      useClass: KyselyUserRepository,
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
