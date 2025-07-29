import { TicketEntity } from './ticket.entity';

export interface ITicketRepository {
  save(ticket: TicketEntity): Promise<void>;
  findOneById(id: string): Promise<TicketEntity | null>;
}

export const TicketRepository = Symbol.for('ticket:ITicketRepository');
