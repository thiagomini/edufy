import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import * as request from 'supertest';
import { configServer } from '../../src/server-config';

describe('Signup (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configServer(app);
    await app.init();
  });

  describe('success cases', () => {
    test.todo('successfully signs up a user with valid data');
  });
  describe('error cases', () => {
    test('returns an error when signup data is invalid', async () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          name: '',
          email: 'invalid-email',
          password: 'short',
        })
        .expect(400)
        .expect({
          statusCode: 400,
          error: 'Bad Request',
          message: [
            'name should not be empty',
            'email must be an email',
            'password must be longer than or equal to 8 characters',
          ],
        });
    });
    test.todo('returns an error when the password is too short');
    test.todo('returns an error when email is already in use');
  });
});
