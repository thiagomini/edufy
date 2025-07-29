import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '@src/user/presentation/jwt.guard';
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

  @UseGuards(JwtGuard)
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
    return {
      message: `Ticket with ID ${id} has been resolved.`,
    };
  }
}
