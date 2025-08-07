import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@src/app/app.module';
import { PurchaseConfirmedEvent } from '@src/app/user/domain/purchase-confirmed.event';
import { configServer } from '@src/server-config';
import { createDSL, DSL } from '@test/dsl/dsl.factory';
import { response } from '@test/utils/response';
import { WebhookHMACBuilder } from '@test/utils/webhook-hmac.builder';
import { randomUUID } from 'node:crypto';

describe('Confirm Purchase (e2e)', () => {
  let app: INestApplication;
  let dsl: DSL;
  let hmacBuilder: WebhookHMACBuilder;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication({
      rawBody: true,
    });
    configServer(app);
    await app.init();
    dsl = createDSL(app);
    hmacBuilder = WebhookHMACBuilder.for(app);
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
      const purchaseConfirmedEvent = new PurchaseConfirmedEvent({
        data: { id: randomUUID() },
        timestamp: new Date().toISOString(),
      });
      return dsl.users
        .confirmPurchase(purchaseConfirmedEvent)
        .expect(403)
        .expect(response.forbidden('HMAC header is missing'));
    });
    test('returns an error when request data is invalid', () => {
      const purchaseConfirmedEvent: PurchaseConfirmedEvent = {
        data: { id: 'not-a-uuid' },
        timestamp: new Date().toISOString(),
        type: 'purchase.confirmed',
      } as const;

      const hmac = hmacBuilder.buildForPayload(purchaseConfirmedEvent);
      return dsl.users
        .usingHMAC(hmac)
        .confirmPurchase(purchaseConfirmedEvent)
        .expect(400)
        .expect(response.validationFailed(['Invalid UUID']));
    });
    test.todo('returns an error when purchase does not exist');
  });
});
