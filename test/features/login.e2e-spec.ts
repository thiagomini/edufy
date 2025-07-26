import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { configServer } from '../../src/server-config';
import { DSL, createDSL } from '../dsl/dsl.factory';

describe('Login (e2e)', () => {
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
    test.skip('successfully logs in a user with valid credentials', async () => {
      await dsl.users
        .createUser({
          name: 'John Doe',
          email: 'john.doe@mail.com',
          password: 'password123',
        })
        .expect(201);
      const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

      const response = await dsl.users
        .login({
          email: 'john.doe@mail.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body).toEqual({
        jwtAccessToken: expect.stringMatching(jwtRegex),
      });
    });
  });

  describe('error cases', () => {
    test('returns an error when login data is invalid', async () => {
      return dsl.users
        .login({
          email: 'invalid-email',
          password: 'short',
        })
        .expect(400)
        .expect({
          statusCode: 400,
          error: 'Bad Request',
          message: [
            'email must be an email',
            'password must be longer than or equal to 8 characters',
          ],
        });
    });
    test.skip('returns an error when password is incorrect', async () => {
      await dsl.users
        .createUser({
          name: 'John Test',
          email: 'john-wrong-pass-test@mail.com',
          password: 'password123',
        })
        .expect(201);

      return dsl.users
        .login({
          email: 'john-wrong-pass-test@mail.com',
          password: 'wrong-password',
        })
        .expect(401)
        .expect({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Invalid email or password',
        });
    });
    test.skip('returns an error when email is incorrect', async () => {
      await dsl.users
        .createUser({
          name: 'John Test',
          email: 'john-wrong-email-test@mail.com',
          password: 'password123',
        })
        .expect(201);

      return dsl.users
        .login({
          email: 'john-wrong-email-test@mail.com',
          password: 'password123',
        })
        .expect(401)
        .expect({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Invalid email or password',
        });
    });
  });
});
