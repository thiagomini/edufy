import { Module } from '@nestjs/common';
import { EmailModule } from '@src/libs/email/email.module';
import { ConfiguredJwtModule } from '@src/libs/jwt/jwt.module';
import { TicketRepository } from './domain/ticket.repository';
import { KyselyTicketRepository } from './infrastructure/kysely.ticket.repository';
import { TicketController } from './presentation/ticket.controller';

@Module({
  imports: [ConfiguredJwtModule, EmailModule],
  controllers: [TicketController],
  providers: [
    {
      provide: TicketRepository,
      useClass: KyselyTicketRepository,
    },
  ],
  exports: [TicketRepository],
})
export class TicketModule {}
