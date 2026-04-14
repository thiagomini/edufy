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

import { ReplyTicketDto } from '@src/app/support/presentation/dtos/reply-ticket.dto';
import { TicketReadDto } from '@src/app/support/presentation/dtos/ticket.read-dto';
import { UserEntity } from '@src/app/user/domain/user.entity';
import { CurrentUser } from '@src/app/user/presentation/current-user.decorator';
import { parseUUIDWithMessage } from '@src/libs/validation/parse-uuid-with-message.pipe';
import {
  TicketRepository,
  ITicketRepository,
} from '../../domain/ticket.repository';
import { TicketStatus } from '../../domain/ticket.status';

@Controller('support')
export class TicketController {
  constructor(
    @Inject(TicketRepository)
    private readonly ticketRepository: ITicketRepository,
  ) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('tickets/:id/reply')
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
}
