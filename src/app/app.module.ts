import { Module } from '@nestjs/common';
import { CourseModule } from '@src/app/course/course.module';
import { ValidationModule } from '@src/libs/validation/validation.module';
import { ConfigurationModule } from '../libs/configuration/configuration.module';
import { DatabaseModule } from '../libs/database/database.module';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { TicketModule } from './ticket/ticket.module';
import { UserModule } from './user/user.module';
import { AppService } from './app.service';

@Module({
  imports: [
    UserModule,
    ConfigurationModule,
    TicketModule,
    AdminModule,
    DatabaseModule,
    CourseModule,
    ValidationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
