import { INestApplication } from '@nestjs/common';
import { UsersDSL } from './users.dsl';
import { TicketsDSL } from './tickets.dsl';
import { AdminDSL } from './admin.dsl';

export function createDSL(app: INestApplication) {
  return {
    users: new UsersDSL(app),
    tickets: new TicketsDSL(app),
    admin: new AdminDSL(app),
  };
}

export type DSL = ReturnType<typeof createDSL>;
