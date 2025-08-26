import { AbstractDSL } from './abstract.dsl';

export class TicketsDSL extends AbstractDSL {
  create(data: { title: string; description: string }) {
    return this.req().post('/tickets').set(this.headers).send(data);
  }
  getById(ticketId: string) {
    return this.req().get(`/tickets/${ticketId}`).set(this.headers);
  }
  reply(ticketId: string, data: { content: string }) {
    return this.req()
      .post(`/tickets/${ticketId}/reply`)
      .set(this.headers)
      .send(data);
  }
}
