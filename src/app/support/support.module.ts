import { Module } from '@nestjs/common';
import { EmailModule } from '@src/libs/email/email.module';

import { ClientRepository } from './domain/client.repository';
import { KyselyClientRepository } from './infrastructure/kysely.client-repository';
import { AgentController } from './presentation/controllers/agent.controller';
import { ClientController } from './presentation/controllers/client.controller';
import { TicketController } from './presentation/controllers/ticket.controller';
import { TicketRepository } from './domain/ticket.repository';
import { KyselyTicketRepository } from './infrastructure/kysely.ticket.repository';

@Module({
  imports: [EmailModule],
  controllers: [ClientController, AgentController, TicketController],
  providers: [
    {
      provide: TicketRepository,
      useClass: KyselyTicketRepository,
    },
    {
      provide: ClientRepository,
      useClass: KyselyClientRepository,
    },
  ],
  exports: [TicketRepository],
})
export class SupportModule {}
