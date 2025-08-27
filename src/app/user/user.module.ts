import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfiguredJwtModule } from '@src/libs/jwt/jwt.module';
import { CourseModule } from '../course/course.module';
import { SupportModule } from '../support/support.module';
import { UserService } from './application/user.service';
import { UserRepository } from './domain/user.repository';
import { KyselyUserRepository } from './infrastructure/kysely.user.repository';
import { JwtGuard } from './presentation/jwt.guard';
import { UserController } from './presentation/user.controller';

@Module({
  imports: [ConfiguredJwtModule, CourseModule, SupportModule],
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
