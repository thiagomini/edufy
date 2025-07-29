import { TicketEntity } from './ticket.entity';

export interface ITicketRepository {
  save(ticket: TicketEntity): Promise<void>;
}

export const TicketRepository = Symbol.for('ticket:ITicketRepository');
