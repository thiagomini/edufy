import { Module } from '@nestjs/common';
import { ClientController } from './client/client.controller';
import { TicketRepository } from '../ticket/domain/ticket.repository';
import { KyselyTicketRepository } from '../ticket/infrastructure/kysely.ticket.repository';
import { AgentController } from './agent/agent.controller';
import { EmailModule } from '@src/libs/email/email.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [EmailModule, UserModule],
  controllers: [ClientController, AgentController],
  providers: [
    {
      provide: TicketRepository,
      useClass: KyselyTicketRepository,
    },
  ],
  exports: [TicketRepository],
})
export class SupportModule {}
