import { Controller, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../user/jwt.guard';

@Controller('tickets')
export class TicketController {
  @UseGuards(JwtGuard)
  @Post('/')
  create(ticket: { title: string; description: string }) {
    return {
      message: 'Ticket created successfully',
      ticket,
    };
  }
}
