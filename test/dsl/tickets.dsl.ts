import { AbstractDSL } from './abstract.dsl';

export class TicketsDSL extends AbstractDSL {
  getById(ticketId: string) {
    return this.req().get(`/tickets/${ticketId}`).set(this.headers);
  }
}
