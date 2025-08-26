import { Body, Controller, Inject, Post } from '@nestjs/common';
import { TicketEntity } from '@src/app/ticket/domain/ticket.entity';
import {
  TicketRepository,
  ITicketRepository,
} from '@src/app/ticket/domain/ticket.repository';
import { TicketReadDto } from '@src/app/ticket/presentation/dto/ticket.read-dto';
import { UserEntity } from '@src/app/user/domain/user.entity';
import { CurrentUser } from '@src/app/user/presentation/current-user.decorator';
import { CreateTicketDto } from '../dtos/create-ticket.dto';

@Controller('support/client')
export class ClientController {
  constructor(
    @Inject(TicketRepository)
    private readonly ticketRepository: ITicketRepository,
  ) {}

  @Post('tickets/')
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
    return new TicketReadDto(newTicket);
  }
}
