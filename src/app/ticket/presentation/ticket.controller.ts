import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { UserEntity } from '@src/app/user/domain/user.entity';
import { CurrentUser } from '@src/app/user/presentation/current-user.decorator';
import { parseUUIDWithMessage } from '@src/libs/validation/parse-uuid-with-message.pipe';
import { TicketEntity } from '../domain/ticket.entity';
import {
  ITicketRepository,
  TicketRepository,
} from '../domain/ticket.repository';
import { TicketStatus } from '../domain/ticket.status';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { ReplyTicketDto } from './dto/reply-ticket.dto';
import { TicketReadDto } from './dto/ticket.read-dto';

@Controller('tickets')
export class TicketController {
  constructor(
    @Inject(TicketRepository)
    private readonly ticketRepository: ITicketRepository,
  ) {}

  @Get(':id')
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
    return new TicketReadDto(newTicket);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(':id/reply')
  async reply(
    @Param('id', parseUUIDWithMessage('Invalid ticket ID format'))
    id: string,
    @Body() replyData: ReplyTicketDto,
    @CurrentUser() user: UserEntity,
  ) {
    const ticket = await this.ticketRepository.findOneById(id);
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    if (ticket.status !== TicketStatus.Open) {
      throw new BadRequestException(
        `Ticket with ID ${id} is not open and cannot be replied to`,
      );
    }
    ticket.replies.push({
      content: replyData.content,
      createdBy: user.id,
    });
    await this.ticketRepository.save(ticket);
  }

  @HttpCode(HttpStatus.OK)
  @Post(':id/resolve')
  async resolve(
    @Param('id', parseUUIDWithMessage('Invalid ticket ID format'))
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
    ticket.status = 'closed';
    ticket.resolvedBy = user.id;
    await this.ticketRepository.save(ticket);
    return new TicketReadDto(ticket);
  }
}
