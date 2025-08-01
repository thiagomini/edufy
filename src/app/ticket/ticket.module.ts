import { Module } from '@nestjs/common';
import { ConfiguredJwtModule } from '@src/libs/jwt/jwt.module';
import { UserModule } from '@src/app/user/user.module';
import { KyselyTicketRepository } from './infrastructure/kysely.ticket.repository';
import { TicketController } from './presentation/ticket.controller';
import { TicketRepository } from './domain/ticket.repository';

@Module({
  imports: [ConfiguredJwtModule, UserModule],
  controllers: [TicketController],
  providers: [
    {
      provide: TicketRepository,
      useClass: KyselyTicketRepository,
    },
  ],
})
export class TicketModule {}
