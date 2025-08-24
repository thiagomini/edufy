import { Module } from '@nestjs/common';
import { ClientController } from './client/client.controller';
import { TicketRepository } from '../ticket/domain/ticket.repository';
import { KyselyTicketRepository } from '../ticket/infrastructure/kysely.ticket.repository';

@Module({
  controllers: [ClientController],
  providers: [
    {
      provide: TicketRepository,
      useClass: KyselyTicketRepository,
    },
  ],
  exports: [TicketRepository],
})
export class SupportModule {}
