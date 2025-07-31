import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { CreateTicketDto } from './create-ticket.dto';
import { TicketEntity } from './ticket.entity';
import { ITicketRepository, TicketRepository } from './ticket.repository';
import { CurrentUser } from '@src/user/presentation/current-user.decorator';
import { UserEntity } from '@src/user/domain/user.entity';

@Controller('tickets')
export class TicketController {
  constructor(
    @Inject(TicketRepository)
    private readonly ticketRepository: ITicketRepository,
  ) {}

  @Post('/')
  async create(
    @Body() ticket: CreateTicketDto,
    @CurrentUser() user: UserEntity,
  ) {
    const newTicket = new TicketEntity(
      ticket.title,
      ticket.description,
      user.id,
    );
    await this.ticketRepository.save(newTicket);
    return {
      id: newTicket.id,
      title: newTicket.title,
      description: newTicket.description,
      status: newTicket.status,
      createdBy: newTicket.createdBy,
    };
  }

  @Post(':id/resolve')
  async resolve(
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory() {
          return new BadRequestException('Invalid ticket ID format');
        },
      }),
    )
    id: string,
  ) {
    const ticket = await this.ticketRepository.findOneById(id);
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    if (ticket.status !== 'open') {
      throw new BadRequestException(
        `Ticket with ID ${id} is not open and cannot be resolved`,
      );
    }
    ticket.status = 'closed'; // Assuming the status can be changed directly
    await this.ticketRepository.save(ticket);
    return {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
    };
  }
}
