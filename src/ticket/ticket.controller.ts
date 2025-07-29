import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../user/jwt.guard';
import { CreateTicketDto } from './create-ticket.dto';
import { TicketEntity } from './ticket.entity';
import { ITicketRepository, TicketRepository } from './ticket.repository';

@Controller('tickets')
export class TicketController {
  constructor(
    @Inject(TicketRepository)
    private readonly ticketRepository: ITicketRepository,
  ) {}

  @UseGuards(JwtGuard)
  @Post('/')
  async create(@Body() ticket: CreateTicketDto) {
    const newTicket = new TicketEntity(ticket.title, ticket.description);
    await this.ticketRepository.save(newTicket);
    return {
      id: newTicket.id,
      title: newTicket.title,
      description: newTicket.description,
      status: newTicket.status,
    };
  }
}
