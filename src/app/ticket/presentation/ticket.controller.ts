import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
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
import { EmailService } from '@src/libs/email/email.service';
import {
  IUserRepository,
  UserRepository,
} from '@src/app/user/domain/user.repository';

@Controller('')
export class TicketController {
  constructor(
    @Inject(TicketRepository)
    private readonly ticketRepository: ITicketRepository,
    private readonly emailService: EmailService,
    @Inject(UserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

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

  @HttpCode(HttpStatus.OK)
  @Post('tickets/:id/resolve')
  async resolve(
    @Param('id', parseUUIDWithMessage('Invalid ticket ID format'))
    id: string,
    @CurrentUser() user: UserEntity,
  ) {
    if (user.role !== 'support_agent') {
      throw new ForbiddenException(
        'You do not have permission to resolve this ticket',
      );
    }
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

    // Enviar um email ao criador do ticket
    const creator = await this.userRepository.findOneById(ticket.createdBy);
    await this.sendTicketResolvedEmail(creator, ticket);
    return new TicketReadDto(ticket);
  }

  private async sendTicketResolvedEmail(to: UserEntity, ticket: TicketEntity) {
    const email = to.email;
    await this.emailService.send({
      to: email,
      subject: `O ticket ${ticket.id} foi resolvido!`,
      body: `Seu Ticket ${ticket.title} foi resolvido com sucesso!`,
    });
  }

  @Get('users/me/tickets')
  async getMyTickets(@CurrentUser() user: UserEntity) {
    const userTickets = await this.ticketRepository.findAllCreatedByUser(
      user.id,
    );
    return userTickets.map((ticket) => new TicketReadDto(ticket));
  }
}
