import { Body, Controller, Inject, Post } from '@nestjs/common';
import {
  ITicketRepository,
  TicketRepository,
} from '@src/app/ticket/domain/ticket.repository';
import { TicketReadDto } from '@src/app/ticket/presentation/dto/ticket.read-dto';
import { ClientEntity } from '../../domain/client.entity';
import { CreateTicketDto } from '../dtos/create-ticket.dto';
import { CurrentClient } from '../decorators/current-client.decorator';

@Controller('support/client')
export class ClientController {
  constructor(
    @Inject(TicketRepository)
    private readonly ticketRepository: ITicketRepository,
  ) {}

  @Post('tickets/')
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
}
