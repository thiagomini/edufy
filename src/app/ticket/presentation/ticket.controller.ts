import { Controller, Get, Inject } from '@nestjs/common';
import { UserEntity } from '@src/app/user/domain/user.entity';
import { CurrentUser } from '@src/app/user/presentation/current-user.decorator';
import {
  ITicketRepository,
  TicketRepository,
} from '../domain/ticket.repository';
import { TicketReadDto } from './dto/ticket.read-dto';

@Controller('')
export class TicketController {
  constructor(
    @Inject(TicketRepository)
    private readonly ticketRepository: ITicketRepository,
  ) {}

  @Get('users/me/tickets')
  async getMyTickets(@CurrentUser() user: UserEntity) {
    const userTickets = await this.ticketRepository.findAllCreatedByUser(
      user.id,
    );
    return userTickets.map((ticket) => new TicketReadDto(ticket));
  }
}
