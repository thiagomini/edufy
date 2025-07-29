import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import { configServer } from '@src/server-config';
import { createDSL, DSL } from '@test/dsl/dsl.factory';

describe('Signup (e2e)', () => {
  let app: INestApplication;
  let dsl: DSL;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configServer(app);
    await app.init();
    dsl = createDSL(app);
  });

  describe('success cases', () => {
    test('successfully signs up a user with valid data', async () => {
      const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

      const response = await dsl.users
        .createUser({
          name: 'John Doe',
          email: 'john.doe@mail.com',
          password: 'password123',
        })
        .expect(201);

      expect(response.body).toEqual({
        jwtAccessToken: expect.stringMatching(jwtRegex),
      });
    });
  });
  describe('error cases', () => {
    test('returns an error when signup data is invalid', async () => {
      return dsl.users
        .createUser({
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
    test('returns an error when email is already in use', async () => {
      await dsl.users
        .createUser({
          name: 'john',
          email: 'john@mail.com',
          password: 'password123',
        })
        .expect(201);

      return dsl.users
        .createUser({
          name: 'john',
          email: 'john@mail.com',
          password: 'password123',
        })
        .expect(409)
        .expect({
          statusCode: 409,
          error: 'Conflict',
          message: 'Email already in use',
        });
    });
  });
});
