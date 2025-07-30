import { AbstractDSL } from './abstract.dsl';

export class AdminDSL extends AbstractDSL {
  createSupportAgent(data: { email: string; name: string; password: string }) {
    return this.req()
      .post('/admin/support-agents')
      .set(this.headers)
      .send(data);
  }
}
