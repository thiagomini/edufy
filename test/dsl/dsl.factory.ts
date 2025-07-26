import { INestApplication } from '@nestjs/common';
import { UsersDSL } from './users.dsl';

export function createDSL(app: INestApplication) {
  return {
    users: new UsersDSL(app),
  };
}

export type DSL = ReturnType<typeof createDSL>;
