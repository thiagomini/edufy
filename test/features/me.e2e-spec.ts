import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { configServer } from '../../src/server-config';
import { DSL, createDSL } from '../dsl/dsl.factory';

describe('Me (e2e)', () => {
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
    test.only('returns user data when authenticated', async () => {
      const jwtAccessToken = await dsl.users
        .createUser({
          name: 'Test User',
          email: 'testuser@example.com',
          password: 'password123',
        })
        .expect(201)
        .then((response) => response.body.jwtAccessToken);

      return dsl.users
        .authenticatedAs(jwtAccessToken)
        .me()
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual({
            id: expect.any(String),
            name: 'Test User',
            email: 'testuser@example.com',
          });
        });
    });
  });

  describe('error cases', () => {
    test('returns an error when request is not authenticated', () => {
      return dsl.users.me().expect(401).expect({
        statusCode: 401,
        message: 'Authorization header is missing or malformed',
        error: 'Unauthorized',
      });
    });
  });
});
