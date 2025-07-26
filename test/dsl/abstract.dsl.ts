import { INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';

export abstract class AbstractDSL {
  constructor(protected readonly app: INestApplication) {}

  protected req() {
    return supertest(this.app.getHttpServer());
  }
}
