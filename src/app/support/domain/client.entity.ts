import {
  CreateTicketInput,
  TicketEntity,
} from '@src/app/ticket/domain/ticket.entity';
import { randomUUID, UUID } from 'node:crypto';

export interface CreateClientInput {
  name: string;
  email: string;
  id?: UUID;
}

export interface ClientProps {
  id: string;
  name: string;
  email: string;
}

export class ClientEntity {
  private constructor(
    public readonly id: UUID,
    public name: string,
    public readonly email: string,
  ) {}

  public static create(input: CreateClientInput): ClientEntity {
    return new ClientEntity(input.id ?? randomUUID(), input.name, input.email);
  }

  public static fromProps(props: ClientProps): ClientEntity {
    return new ClientEntity(props.id as UUID, props.name, props.email);
  }

  createTicket(props: Pick<CreateTicketInput, 'title' | 'description'>) {
    return TicketEntity.create({
      title: props.title,
      description: props.description,
      createdBy: this.id,
    });
  }
}
