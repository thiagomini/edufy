import { INestApplication } from '@nestjs/common';
import { Jwt } from '@src/libs/jwt/jwt';
import * as supertest from 'supertest';

export abstract class AbstractDSL {
  constructor(
    protected readonly app: INestApplication,
    protected headers: Record<string, string> = {},
  ) {}

  protected req() {
    return supertest(this.app.getHttpServer());
  }

  public authenticatedAs(jwt: Jwt | string): this {
    return new (this.constructor as new (...args: any[]) => this)(this.app, {
      authorization: `Bearer ${jwt}`,
    });
  }

  public usingAdminKey(adminKey: string): this {
    return new (this.constructor as new (...args: any[]) => this)(this.app, {
      ...this.headers,
      'x-admin-key': adminKey,
    });
  }
}
