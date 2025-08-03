import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigurationModule } from '../libs/configuration/configuration.module';
import { TicketModule } from './ticket/ticket.module';
import { AdminModule } from './admin/admin.module';
import { DatabaseModule } from '../libs/database/database.module';
import { CourseModule } from '@src/app/course/course.module';

@Module({
  imports: [
    UserModule,
    ConfigurationModule,
    TicketModule,
    AdminModule,
    DatabaseModule,
    CourseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
