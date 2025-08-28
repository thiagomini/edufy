import { INestApplication } from '@nestjs/common';
import { PurchaseConfirmedEvent } from '@src/app/user/domain/purchase-confirmed.event';
import { createDSL, DSL } from '@test/dsl/dsl.factory';
import { workflows } from '@test/dsl/workflows';
import { response, validationErrors } from '@test/utils/response';
import { createTestingApp } from '@test/utils/testing-app.factory';
import { WebhookHMACBuilder } from '@src/libs/webhook/webhook-hmac.builder';
import { randomUUID } from 'node:crypto';
import { waitFor } from '@test/utils/wait-for';

describe('Confirm Purchase (e2e)', () => {
  let app: INestApplication;
  let dsl: DSL;
  let hmacBuilder: WebhookHMACBuilder;

  beforeAll(async () => {
    app = await createTestingApp();
    dsl = createDSL(app);
    hmacBuilder = app.get(WebhookHMACBuilder, { strict: false });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('success cases', () => {
    test('successfully confirms a purchase', async () => {
      // Arrange
      const instructorJwt =
        await workflows(dsl).createUserWithRole('instructor');
      const newRustCourse = await dsl.courses
        .authenticatedAs(instructorJwt)
        .create({
          description: 'Rust Course',
          title: 'Learn Rust',
          price: 500,
        })
        .expect(201)
        .then((res) => res.body);

      // Student Purchase
      const studentJwt = await workflows(dsl).createUserWithRole('student');
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
      await dsl.payments
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

      await waitFor(
        async () => {
          await dsl.users
            .authenticatedAs(studentJwt)
            .getEnrollments()
            .expect(200)
            .expect((response) => {
              expect(response.body).toEqual([
                {
                  courseId: newRustCourse.id,
                  studentId: studentJwt.payload().sub,
                  enrolledAt: expect.any(String),
                },
              ]);
            });
        },
        {
          interval: 1000,
          timeout: 5000,
        },
      );
    });
    test.todo('ignores duplicate confirmations for the same purchase');
  });
  describe('error cases', () => {
    test('returns an error when request is unauthenticated', () => {
      const purchaseConfirmedEvent = new PurchaseConfirmedEvent({
        data: { id: randomUUID() },
        timestamp: new Date().toISOString(),
      });
      return dsl.payments
        .confirmPurchase(purchaseConfirmedEvent)
        .expect(403)
        .expect(response.forbidden('HMAC header is missing'));
    });
    test('returns an error when request data is invalid', () => {
      const purchaseConfirmedEvent: PurchaseConfirmedEvent = {
        data: { id: randomUUID() },
        timestamp: new Date().toISOString(),
        type: '' as 'purchase.confirmed',
      } as const;

      const hmac = hmacBuilder.buildForPayload(purchaseConfirmedEvent);
      return dsl.payments
        .usingHMAC(hmac)
        .confirmPurchase(purchaseConfirmedEvent)
        .expect(400)
        .expect(
          response.validationFailed([validationErrors.isNotEmpty('type')]),
        );
    });
  });
});
