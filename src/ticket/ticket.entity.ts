import { randomUUID } from 'node:crypto';

export class TicketEntity {
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly status: 'open' | 'closed' = 'open',
    public readonly id: string = randomUUID(),
  ) {}
}
