import { Module } from '@nestjs/common';
import { CourseModule } from '@src/app/course/course.module';
import { ValidationModule } from '@src/libs/validation/validation.module';
import { ConfigurationModule } from '../libs/configuration/configuration.module';
import { DatabaseModule } from '../libs/database/database.module';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { UserModule } from './user/user.module';
import { AppService } from './app.service';
import { DebugModule } from './debug/debug.module';
import { ConditionalModule } from '@nestjs/config';
import { SupportModule } from './support/support.module';

@Module({
  imports: [
    UserModule,
    ConfigurationModule,
    AdminModule,
    DatabaseModule,
    CourseModule,
    ValidationModule,
    ConditionalModule.registerWhen(DebugModule, (env) => env.DEBUG === 'true'),
    SupportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
