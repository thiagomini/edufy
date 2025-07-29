import { Module } from '@nestjs/common';
import { UserModule } from '@src/user/user.module';
import { TicketController } from './ticket.controller';
import { ConfiguredJwtModule } from '@src/jwt/jwt.module';
import { TicketRepository } from './ticket.repository';
import { InMemoryTicketRepository } from './in-memory.ticket.repository';

@Module({
  imports: [ConfiguredJwtModule, UserModule],
  controllers: [TicketController],
  providers: [
    {
      provide: TicketRepository,
      useClass: InMemoryTicketRepository,
    },
  ],
})
export class TicketModule {}
