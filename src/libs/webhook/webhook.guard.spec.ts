import type { Provider } from '@nestjs/common';
import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { WebhookModule } from './webhook.module';
import {
  HMAC_HEADER,
  SECRET_KEY,
  WebhookTestController,
} from './test/webhook-test.controller';
import { WebhookHMACBuilder } from '@test/utils/webhook-hmac.builder';

describe('WebhookGuard', () => {
  let testingApp: INestApplication;
  const webhookSecretValue = 'webhook-secret-value';

  const secretKeyProvider: Provider = {
    provide: SECRET_KEY,
    useValue: {
      webhookSecret: webhookSecretValue,
    },
  };

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      imports: [WebhookModule],
      controllers: [WebhookTestController],
      providers: [secretKeyProvider],
    }).compile();

    testingApp = testingModule.createNestApplication({
      rawBody: true,
    });

    await testingApp.init();
  });

  afterAll(async () => {
    await testingApp.close();
  });

  test('returns unauthorized error when HMAC signature is invalid', async () => {
    // Arrange
    const eventPayload = { timestamp: new Date().toISOString() };
    const hmac = new WebhookHMACBuilder('invalid').buildForPayload(
      eventPayload,
    );

    // Act
    await request(testingApp.getHttpServer())
      .post('/test/events')
      .set(HMAC_HEADER, hmac)
      .send(eventPayload)
      // Assert
      .expect(403);
  });

  test('returns unauthorized error when HMAC signature does not match payload', async () => {
    // Arrange
    const eventPayload = { timestamp: new Date().toISOString() };
    const hmac = new WebhookHMACBuilder(webhookSecretValue).buildForPayload({
      timestamp: 'invalid',
    });

    // Act
    await request(testingApp.getHttpServer())
      .post('/test/events')
      .set(HMAC_HEADER, hmac)
      .send(eventPayload)
      // Assert
      .expect(403);
  });

  test('returns 201 when HMAC signature is valid', async () => {
    // Arrange
    const eventPayload = { timestamp: new Date().toISOString() };
    const hmac = new WebhookHMACBuilder(webhookSecretValue).buildForPayload(
      eventPayload,
    );

    // Act
    await request(testingApp.getHttpServer())
      .post('/test/events')
      .set(HMAC_HEADER, hmac)
      .send(eventPayload)
      // Assert
      .expect(201)
      .expect(eventPayload);
  });
});
