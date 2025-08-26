import { Module } from '@nestjs/common';
import { EmailModule } from '@src/libs/email/email.module';
import { TicketRepository } from '../ticket/domain/ticket.repository';
import { KyselyTicketRepository } from '../ticket/infrastructure/kysely.ticket.repository';
import { ClientRepository } from './domain/client.repository';
import { KyselyClientRepository } from './infrastructure/kysely.client-repository';
import { AgentController } from './presentation/controllers/agent.controller';
import { ClientController } from './presentation/controllers/client.controller';

@Module({
  imports: [EmailModule],
  controllers: [ClientController, AgentController],
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
