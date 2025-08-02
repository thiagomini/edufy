import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { CreateTicketDto } from './create-ticket.dto';
import { TicketEntity } from '../domain/ticket.entity';
import {
  ITicketRepository,
  TicketRepository,
} from '../domain/ticket.repository';
import { CurrentUser } from '@src/app/user/presentation/current-user.decorator';
import { UserEntity } from '@src/app/user/domain/user.entity';

@Controller('tickets')
export class TicketController {
  constructor(
    @Inject(TicketRepository)
    private readonly ticketRepository: ITicketRepository,
  ) {}

  @Get(':id')
  async getTicketById(
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: () =>
          new BadRequestException('Invalid ticket ID format'),
      }),
    )
    id: string,
  ) {
    const ticket = await this.ticketRepository.findOneById(id);
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
  }

  @Post('/')
  async create(
    @Body() ticket: CreateTicketDto,
    @CurrentUser() user: UserEntity,
  ) {
    const newTicket = TicketEntity.create({
      title: ticket.title,
      description: ticket.description,
      createdBy: user.id,
    });
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
    @CurrentUser() user: UserEntity,
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
      resolvedBy: user.id,
    };
  }
}
