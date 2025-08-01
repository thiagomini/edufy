import { Module } from '@nestjs/common';
import { ConfiguredJwtModule } from '@src/libs/jwt/jwt.module';
import { UserModule } from '@src/app/user/user.module';
import { KyselyTicketRepository } from './kysely.ticket.repository';
import { TicketController } from './ticket.controller';
import { TicketRepository } from './ticket.repository';

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
