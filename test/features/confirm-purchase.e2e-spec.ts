import { INestApplication } from '@nestjs/common';
import { PurchaseConfirmedEvent } from '@src/app/user/domain/purchase-confirmed.event';
import { createDSL, DSL } from '@test/dsl/dsl.factory';
import { response } from '@test/utils/response';
import { createTestingApp } from '@test/utils/testing-app.factory';
import { WebhookHMACBuilder } from '@test/utils/webhook-hmac.builder';
import { randomUUID } from 'node:crypto';

describe('Confirm Purchase (e2e)', () => {
  let app: INestApplication;
  let dsl: DSL;
  let hmacBuilder: WebhookHMACBuilder;

  beforeAll(async () => {
    app = await createTestingApp();
    dsl = createDSL(app);
    hmacBuilder = WebhookHMACBuilder.for(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('success cases', () => {
    test('successfully confirms a purchase', async () => {
      // Arrange
      const instructorJwt = await dsl.users.createUserWithRole('instructor');
      const newRustCourse = await dsl.courses
        .authenticatedAs(instructorJwt)
        .create({
          description: 'Rust Course',
          title: 'Learn Rust',
          price: 500,
        })
        .expect(201)
        .then((res) => res.body);

      const studentJwt = await dsl.users.createUserWithRole('student');
      const purchase = await dsl.courses
        .authenticatedAs(studentJwt)
        .checkout(newRustCourse.id)
        .expect(200)
        .then((res) => res.body);

      const purchaseConfirmedEvent = new PurchaseConfirmedEvent({
        data: { id: purchase.id },
        timestamp: '2025-08-08T13:02:55.972Z',
      });
      const hmac = hmacBuilder.buildForPayload(purchaseConfirmedEvent);

      // Act
      await dsl.users
        .usingHMAC(hmac)
        .confirmPurchase(purchaseConfirmedEvent)
        .expect(204);

      // Assert
      await dsl.courses
        .authenticatedAs(studentJwt)
        .getPurchaseById(purchase.id)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id: purchase.id,
            userId: studentJwt.payload().sub,
            course: {
              id: newRustCourse.id,
              title: newRustCourse.title,
              description: newRustCourse.description,
              price: newRustCourse.price,
              currency: 'BRL',
            },
            purchaseDate: expect.any(String),
            confirmedAt: '2025-08-08T13:02:55.972Z',
            status: 'completed',
          });
        });
    });
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
        data: { id: 'not-really-a-valid-uuid' },
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
    test('returns an error when purchase does not exist', () => {
      const purchaseConfirmedEvent = new PurchaseConfirmedEvent({
        data: { id: randomUUID() },
        timestamp: new Date().toISOString(),
      });
      const hmac = hmacBuilder.buildForPayload(purchaseConfirmedEvent);
      return dsl.users
        .usingHMAC(hmac)
        .confirmPurchase(purchaseConfirmedEvent)
        .expect(404)
        .expect(response.notFound('Purchase not found'));
    });
  });
});
