import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigurationModule } from './configuration/configuration.module';
import { TicketModule } from './ticket/ticket.module';

@Module({
  imports: [UserModule, ConfigurationModule, TicketModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
