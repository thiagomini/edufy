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
  ITicketRepository,
  TicketRepository,
} from '@src/app/ticket/domain/ticket.repository';
import { TicketReadDto } from '@src/app/ticket/presentation/dto/ticket.read-dto';
import { UserEntity } from '@src/app/user/domain/user.entity';
import { CurrentUser } from '@src/app/user/presentation/current-user.decorator';
import { EmailService } from '@src/libs/email/email.service';
import { parseUUIDWithMessage } from '@src/libs/validation/parse-uuid-with-message.pipe';
import { AgentEntity } from '../../domain/agent.entity';
import { ClientEntity } from '../../domain/client.entity';
import {
  ClientRepository,
  IClientRepository,
} from '../../domain/client.repository';

@Controller('support/agent')
export class AgentController {
  constructor(
    @Inject(TicketRepository)
    private readonly ticketRepository: ITicketRepository,
    private readonly emailService: EmailService,
    @Inject(ClientRepository)
    private readonly clientRepository: IClientRepository,
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
    const agent = AgentEntity.fromProps(user);
    try {
      agent.resolve(ticket);
    } catch (error) {
      if (error instanceof Error && error.cause === 'INVALID_TICKET_STATUS') {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
    await this.ticketRepository.save(ticket);

    // Enviar um email ao criador do ticket
    const client = await this.clientRepository.findOneById(ticket.createdBy);
    await this.sendTicketResolvedEmail(client, ticket);
    return new TicketReadDto(ticket);
  }

  private async sendTicketResolvedEmail(
    to: ClientEntity,
    ticket: TicketEntity,
  ) {
    const email = to.email;
    await this.emailService.send({
      to: email,
      subject: `O ticket ${ticket.id} foi resolvido!`,
      body: `Seu Ticket ${ticket.title} foi resolvido com sucesso!`,
    });
  }
}
