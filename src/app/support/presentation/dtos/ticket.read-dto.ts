import { TicketEntity } from '../../domain/ticket.entity';
import { TicketStatusEnum } from '../../domain/ticket.status';

export class TicketReadDto {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly status: TicketStatusEnum;
  readonly createdBy: string;
  readonly resolvedBy: string | null;
  readonly replies: Array<{ content: string; createdBy: string }>;

  constructor(ticket: TicketEntity) {
    this.id = ticket.id;
    this.title = ticket.title;
    this.description = ticket.description;
    this.status = ticket.status;
    this.createdBy = ticket.createdBy;
    this.resolvedBy = ticket.resolvedBy;
    this.replies = ticket.replies.map((reply) => ({
      content: reply.content,
      createdBy: reply.createdBy,
    }));
  }
}
