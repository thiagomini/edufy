import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { WebhookHMACBuilder } from '@src/libs/webhook/webhook-hmac.builder';
import * as request from 'supertest';
import {
  HMAC_HEADER,
  SECRET_KEY,
  WebhookTestController,
} from './test/webhook-test.controller';
import { WebhookModule } from './webhook.module';
import { ConfigurationModule } from '../configuration/configuration.module';

describe('WebhookGuard', () => {
  let testingApp: INestApplication;

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      imports: [WebhookModule, ConfigurationModule],
      controllers: [WebhookTestController],
    }).compile();

    testingApp = testingModule.createNestApplication({
      rawBody: true,
    });

    await testingApp.init();
  });

  afterAll(async () => {
    await testingApp.close();
  });

  test('returns unauthorized error when HMAC header is missing', async () => {
    // Arrange
    const eventPayload = { timestamp: new Date().toISOString() };

    // Act
    await request(testingApp.getHttpServer())
      .post('/test/events')
      .send(eventPayload)
      // Assert
      .expect(403)
      .expect((res) => {
        expect(res.body).toMatchObject({
          message: 'HMAC header is missing',
          statusCode: 403,
        });
      });
  });

  test('returns unauthorized error when HMAC signature is invalid', async () => {
    // Arrange
    const eventPayload = { timestamp: new Date().toISOString() };
    const hmac = new WebhookHMACBuilder({
      hmacHeader: HMAC_HEADER,
      secret: 'invalid',
    }).buildForPayload(eventPayload);

    // Act
    await request(testingApp.getHttpServer())
      .post('/test/events')
      .set(HMAC_HEADER, hmac)
      .send(eventPayload)
      // Assert
      .expect(403)
      .expect((res) => {
        expect(res.body).toMatchObject({
          message: 'Invalid HMAC signature',
          statusCode: 403,
        });
      });
  });

  test('returns unauthorized error when HMAC signature does not match payload', async () => {
    // Arrange
    const eventPayload = { timestamp: new Date().toISOString() };
    const hmac = new WebhookHMACBuilder({
      hmacHeader: HMAC_HEADER,
      secret: SECRET_KEY,
    }).buildForPayload({
      timestamp: 'invalid',
    });

    // Act
    await request(testingApp.getHttpServer())
      .post('/test/events')
      .set(HMAC_HEADER, hmac)
      .send(eventPayload)
      // Assert
      .expect(403)
      .expect((res) => {
        expect(res.body).toMatchObject({
          message: 'Invalid HMAC signature',
          statusCode: 403,
        });
      });
  });

  test('returns 201 when HMAC signature is valid', async () => {
    // Arrange
    const eventPayload = { timestamp: new Date().toISOString() };
    const hmac = new WebhookHMACBuilder({
      hmacHeader: HMAC_HEADER,
      secret: SECRET_KEY,
    }).buildForPayload(eventPayload);

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
