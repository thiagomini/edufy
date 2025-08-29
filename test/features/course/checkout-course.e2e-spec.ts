import { INestApplication } from '@nestjs/common';
import { PurchaseConfirmedEvent } from '@src/app/user/domain/purchase-confirmed.event';
import { Jwt } from '@src/libs/jwt/jwt';
import { DSL, createDSL } from '@test/dsl/dsl.factory';
import { workflows } from '@test/dsl/workflows';
import { response } from '@test/utils/response';
import { createTestingApp } from '@test/utils/testing-app.factory';
import { WebhookHMACBuilder } from '@src/libs/webhook/webhook-hmac.builder';
import { isURL } from 'class-validator';
import { randomUUID, UUID } from 'node:crypto';

describe('Checkout Course (e2e)', () => {
  let app: INestApplication;
  let dsl: DSL;
  let studentUserJwt: Jwt;
  let instructorUserJwt: Jwt;
  let courseId: UUID;
  let hmacBuilder: WebhookHMACBuilder;

  beforeAll(async () => {
    app = await createTestingApp();
    dsl = createDSL(app);
    hmacBuilder = app.get(WebhookHMACBuilder, { strict: false });

    studentUserJwt = await workflows(dsl).createUserWithRole('student');
    instructorUserJwt = await workflows(dsl).createUserWithRole('instructor');
    courseId = await dsl.courses
      .authenticatedAs(instructorUserJwt)
      .create({
        title: 'Python Programming',
        description: 'Learn Python from scratch',
        price: 200,
      })
      .expect(201)
      .then((res) => res.body.id);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('success cases', () => {
    test('successfully starts the checkout process for a course', async () => {
      // Act
      return dsl.courses
        .authenticatedAs(studentUserJwt)
        .checkout(courseId)
        .expect(200)
        .expect((res) => {
          const checkoutUrl = res.body.checkoutUrl;
          expect(checkoutUrl).toBeTruthy();
          const isValid = isURL(checkoutUrl);
          expect(isValid).toBe(true);
        });
    });
  });

  describe('error cases', () => {
    test('returns an error when request is unauthenticated', () => {
      return dsl.courses
        .checkout('course-id')
        .expect(401)
        .expect(response.unauthorized());
    });
    test('returns an error when course id is invalid', () => {
      return dsl.courses
        .authenticatedAs(studentUserJwt)
        .checkout('invalid-id')
        .expect(400)
        .expect(response.badRequest('Invalid course ID format'));
    });
    test('returns an error when course does not exist', async () => {
      return dsl.courses
        .authenticatedAs(studentUserJwt)
        .checkout(randomUUID())
        .expect(404)
        .expect(response.notFound('Course not found'));
    });
    test('returns an error when user is an instructor', () => {
      return dsl.courses
        .authenticatedAs(instructorUserJwt)
        .checkout(randomUUID())
        .expect(403)
        .expect(response.forbidden('Only students can purchase courses'));
    });
    test('returns an error when user has already bought the course', async () => {
      // Arrange
      const { id: purchaseId } = await dsl.courses
        .authenticatedAs(studentUserJwt)
        .checkout(courseId)
        .expect(200)
        .then((res) => res.body);

      const purchaseConfirmedEvent: PurchaseConfirmedEvent = {
        type: 'purchase.confirmed',
        data: { id: purchaseId },
        timestamp: new Date().toISOString(),
      };
      const hmac = hmacBuilder.buildForPayload(purchaseConfirmedEvent);
      await dsl.payments
        .usingHMAC(hmac)
        .confirmPurchase(purchaseConfirmedEvent)
        .expect(204);

      // Act
      return (
        dsl.courses
          .authenticatedAs(studentUserJwt)
          .checkout(courseId)
          // Assert
          .expect(409)
          .expect(response.conflict('You have already purchased this course'))
      );
    });
  });
});
