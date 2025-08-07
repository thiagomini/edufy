import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@src/app/app.module';
import { configServer } from '@src/server-config';
import { DSL, createDSL } from '@test/dsl/dsl.factory';
import { response } from '@test/utils/response';
import { WebhookHMACBuilder } from '@test/utils/webhook-hmac.builder';
import { randomUUID } from 'node:crypto';

describe('Confirm Purchase (e2e)', () => {
  let app: INestApplication;
  let dsl: DSL;
  let _hmacBuilder: WebhookHMACBuilder;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configServer(app);
    await app.init();
    dsl = createDSL(app);
    _hmacBuilder = WebhookHMACBuilder.for(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('success cases', () => {
    test.todo('successfully confirms a purchase');
    test.todo('ignores duplicate confirmations for the same purchase');
  });
  describe('error cases', () => {
    test('returns an error when request is unauthenticated', () => {
      return dsl.users
        .confirmPurchase(randomUUID())
        .expect(403)
        .expect(response.forbidden('HMAC header is missing'));
    });
    test.todo('returns an error when request data is invalid');
    test.todo('returns an error when purchase does not exist');
  });
});
