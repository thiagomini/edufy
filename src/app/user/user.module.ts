import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfiguredJwtModule } from '@src/libs/jwt/jwt.module';
import { UserService } from './application/user.service';
import { KyselyUserRepository } from './infrastructure/kysely.user.repository';
import { UserRepository } from './domain/user.repository';
import { JwtGuard } from './presentation/jwt.guard';
import { UserController } from './presentation/user.controller';
import { TicketModule } from '../ticket/ticket.module';
import { CourseModule } from '../course/course.module';
import { UserWebhook } from './presentation/user.webhook';

@Module({
  imports: [ConfiguredJwtModule, TicketModule, CourseModule],
  controllers: [UserController, UserWebhook],
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
