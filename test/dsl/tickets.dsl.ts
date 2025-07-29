import { AbstractDSL } from './abstract.dsl';

export class TicketsDSL extends AbstractDSL {
  create(data: { title: string; description: string }) {
    return this.req().post('/tickets').set(this.headers).send(data);
  }
  resolve(ticketId: string) {
    return this.req().post(`/tickets/${ticketId}/resolve`).set(this.headers);
  }
}
