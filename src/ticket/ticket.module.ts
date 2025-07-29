import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { TicketController } from './ticket.controller';
import { ConfiguredJwtModule } from '../jwt/jwt.module';

@Module({
  imports: [ConfiguredJwtModule, UserModule],
  controllers: [TicketController],
})
export class TicketModule {}
