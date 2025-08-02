import { TicketEntity } from './ticket.entity';

export interface ITicketRepository {
  save(ticket: TicketEntity): Promise<void>;
  findOneById(id: string): Promise<TicketEntity | null>;
  findAllCreatedByUser(userId: string): Promise<TicketEntity[]>;
}

export const TicketRepository = Symbol.for('ticket:ITicketRepository');
