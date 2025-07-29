import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../user/jwt.guard';
import { CreateTicketDto } from './create-ticket.dto';
import { randomUUID } from 'crypto';

@Controller('tickets')
export class TicketController {
  @UseGuards(JwtGuard)
  @Post('/')
  create(@Body() ticket: CreateTicketDto) {
    return {
      id: randomUUID(),
      title: ticket.title,
      description: ticket.description,
      status: 'open',
    };
  }
}
