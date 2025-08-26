import { TicketEntity } from './ticket.entity';
import { randomUUID, UUID } from 'node:crypto';

export interface CreateAgentInput {
  name: string;
  email: string;
  id?: UUID;
}

export interface AgentProps {
  id: string;
  name: string;
  email: string;
}

export class AgentEntity {
  private constructor(
    public readonly id: UUID,
    public name: string,
    public readonly email: string,
  ) {}

  public static create(input: CreateAgentInput): AgentEntity {
    return new AgentEntity(input.id ?? randomUUID(), input.name, input.email);
  }

  public static fromProps(props: AgentProps): AgentEntity {
    return new AgentEntity(props.id as UUID, props.name, props.email);
  }

  public resolve(ticket: TicketEntity) {
    if (ticket.status !== 'open') {
      throw new Error(
        `Ticket with ID ${ticket.id} is not open and cannot be resolved`,
        {
          cause: 'INVALID_TICKET_STATUS',
        },
      );
    }
    ticket.status = 'closed';
    ticket.resolvedBy = this.id;
  }
}
