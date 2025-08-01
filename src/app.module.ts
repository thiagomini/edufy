import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './app/user/user.module';
import { ConfigurationModule } from './libs/configuration/configuration.module';
import { TicketModule } from './app/ticket/ticket.module';
import { AdminModule } from './app/admin/admin.module';
import { DatabaseModule } from './libs/database/database.module';

@Module({
  imports: [
    UserModule,
    ConfigurationModule,
    TicketModule,
    AdminModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
