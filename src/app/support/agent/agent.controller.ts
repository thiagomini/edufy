import {
  BadRequestException,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { TicketEntity } from '@src/app/ticket/domain/ticket.entity';
import {
  TicketRepository,
  ITicketRepository,
} from '@src/app/ticket/domain/ticket.repository';
import { TicketReadDto } from '@src/app/ticket/presentation/dto/ticket.read-dto';
import { UserEntity } from '@src/app/user/domain/user.entity';
import {
  UserRepository,
  IUserRepository,
} from '@src/app/user/domain/user.repository';
import { CurrentUser } from '@src/app/user/presentation/current-user.decorator';
import { EmailService } from '@src/libs/email/email.service';
import { parseUUIDWithMessage } from '@src/libs/validation/parse-uuid-with-message.pipe';

@Controller('support/agent')
export class AgentController {
  constructor(
    @Inject(TicketRepository)
    private readonly ticketRepository: ITicketRepository,
    private readonly emailService: EmailService,
    @Inject(UserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

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
}
