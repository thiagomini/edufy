import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../user/jwt.guard';
import { CreateTicketDto } from './create-ticket.dto';

@Controller('tickets')
export class TicketController {
  @UseGuards(JwtGuard)
  @Post('/')
  create(@Body() ticket: CreateTicketDto) {
    return {
      message: 'Ticket created successfully',
      ticket,
    };
  }
}
