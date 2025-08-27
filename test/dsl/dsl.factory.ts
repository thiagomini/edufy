import { INestApplication } from '@nestjs/common';
import { UsersDSL } from './users.dsl';
import { AdminDSL } from './admin.dsl';
import { ConfigDSL } from './config.dsl';
import { CoursesDSL } from './courses.dsl';
import { SupportDSL } from './support.dsl';
import { PaymentsDSL } from './payments.dsl';

export function createDSL(app: INestApplication) {
  return {
    users: new UsersDSL(app),
    admin: new AdminDSL(app),
    config: new ConfigDSL(app),
    courses: new CoursesDSL(app),
    support: new SupportDSL(app),
    payments: new PaymentsDSL(app),
    app,
  };
}

export type DSL = ReturnType<typeof createDSL>;
