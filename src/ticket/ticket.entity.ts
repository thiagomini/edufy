import { randomUUID } from 'node:crypto';

export class TicketEntity {
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly createdBy: string,
    public status: 'open' | 'closed' = 'open',
    public readonly id: string = randomUUID(),
  ) {}
}
