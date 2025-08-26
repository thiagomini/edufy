import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { UserEntity } from '@src/app/user/domain/user.entity';
import { CurrentUser } from '@src/app/user/presentation/current-user.decorator';
import { parseUUIDWithMessage } from '@src/libs/validation/parse-uuid-with-message.pipe';
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

  @Get('tickets/:id')
  async getTicketById(
    @Param('id', parseUUIDWithMessage('Invalid ticket ID format'))
    id: string,
  ) {
    const ticket = await this.ticketRepository.findOneById(id);
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    return new TicketReadDto(ticket);
  }

  @Get('users/me/tickets')
  async getMyTickets(@CurrentUser() user: UserEntity) {
    const userTickets = await this.ticketRepository.findAllCreatedByUser(
      user.id,
    );
    return userTickets.map((ticket) => new TicketReadDto(ticket));
  }
}
