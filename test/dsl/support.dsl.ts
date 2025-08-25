import { AbstractDSL } from './abstract.dsl';

export class SupportDSL extends AbstractDSL {
  createTicket(data: { title: string; description: string }) {
    return this.req()
      .post('/support/client/tickets')
      .set(this.headers)
      .send(data);
  }

  resolveTicket(ticketId: string) {
    return this.req()
      .post(`/support/agent/tickets/${ticketId}/resolve`)
      .set(this.headers);
  }
}
