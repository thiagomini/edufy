import { TicketEntity } from '../domain/ticket.entity';
import { ITicketRepository } from '../domain/ticket.repository';

export class InMemoryTicketRepository implements ITicketRepository {
  findAllCreatedByUser(userId: string): Promise<TicketEntity[]> {
    return Promise.resolve(
      Array.from(this.tickets.values()).filter(
        (ticket) => ticket.createdBy === userId,
      ),
    );
  }
  private readonly tickets: Map<string, TicketEntity> = new Map();

  save(ticket: TicketEntity): Promise<void> {
    this.tickets.set(ticket.id, ticket);
    return Promise.resolve();
  }

  async findOneById(id: string): Promise<TicketEntity | null> {
    return this.tickets.get(id) || null;
  }
}
