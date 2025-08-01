import { randomUUID } from 'node:crypto';
import { TicketStatus, TicketStatusEnum } from './ticket.status';

export class TicketEntity {
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly createdBy: string,
    public status: TicketStatusEnum = TicketStatus.Open,
    public readonly id: string = randomUUID(),
  ) {}
}
