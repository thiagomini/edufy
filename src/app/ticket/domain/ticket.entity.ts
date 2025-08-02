import { randomUUID } from 'node:crypto';
import { TicketStatus, TicketStatusEnum } from './ticket.status';

export interface CreateTicketInput {
  title: string;
  description: string;
  createdBy: string;
  status?: TicketStatusEnum;
  id?: string;
}

export interface TicketReply {
  content: string;
  createdBy: string;
}

export interface TicketProps {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  status: TicketStatusEnum;
  resolvedBy?: string;
  replies: TicketReply[];
}

export class TicketEntity {
  private constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string,
    public readonly createdBy: string,
    public status: TicketStatusEnum,
    public readonly resolvedBy?: string,
    public readonly replies: TicketReply[] = [],
  ) {}

  public static create(input: CreateTicketInput): TicketEntity {
    return new TicketEntity(
      input.id ?? randomUUID(),
      input.title,
      input.description,
      input.createdBy,
      input.status ?? TicketStatus.Open,
    );
  }

  public static fromProps(props: TicketProps): TicketEntity {
    return new TicketEntity(
      props.id,
      props.title,
      props.description,
      props.createdBy,
      props.status,
      props.resolvedBy,
      props.replies,
    );
  }
}
