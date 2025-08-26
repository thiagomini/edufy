import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import {
  ITicketRepository,
  TicketRepository,
} from '@src/app/ticket/domain/ticket.repository';
import { TicketReadDto } from '@src/app/ticket/presentation/dto/ticket.read-dto';
import { ClientEntity } from '../../domain/client.entity';
import { CurrentClient } from '../decorators/current-client.decorator';
import { CreateTicketDto } from '../dtos/create-ticket.dto';

@Controller('support/client')
export class ClientController {
  constructor(
    @Inject(TicketRepository)
    private readonly ticketRepository: ITicketRepository,
  ) {}

  @Post('tickets')
  async create(
    @Body() ticket: CreateTicketDto,
    @CurrentClient() client: ClientEntity,
  ) {
    const newTicket = client.createTicket({
      title: ticket.title,
      description: ticket.description,
    });
    await this.ticketRepository.save(newTicket);
    return new TicketReadDto(newTicket);
  }

  @Get('tickets')
  async getMyTickets(@CurrentClient() client: ClientEntity) {
    const userTickets = await this.ticketRepository.findAllCreatedByUser(
      client.id,
    );
    return userTickets.map((ticket) => new TicketReadDto(ticket));
  }
}
