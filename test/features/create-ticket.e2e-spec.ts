import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { configServer } from '../../src/server-config';
import { DSL, createDSL } from '../dsl/dsl.factory';

describe('Submit Ticket (e2e)', () => {
  let app: INestApplication;
  let dsl: DSL;
  let jwtAccessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configServer(app);
    await app.init();
    dsl = createDSL(app);
    jwtAccessToken = await dsl.users
      .createUser({
        name: 'Test User',
        email: 'jwt-test@mail.com',
        password: 'password123',
      })
      .expect(201)
      .then((response) => response.body.jwtAccessToken);
  });

  describe('success cases', () => {
    test('successfully submits a ticket with valid data', async () => {
      return dsl.tickets
        .authenticatedAs(jwtAccessToken)
        .create({
          title: 'Test Ticket',
          description: 'This is a test ticket',
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toEqual({
            id: expect.any(String),
            title: 'Test Ticket',
            description: 'This is a test ticket',
            status: 'open',
          });
        });
    });
  });
  describe('error cases', () => {
    test('returns an error when request is not authenticated', async () => {
      return dsl.tickets
        .create({
          title: 'Test Ticket',
          description: 'This is a test ticket',
        })
        .expect(401)
        .expect({
          statusCode: 401,
          message: 'Authorization header is missing or malformed',
          error: 'Unauthorized',
        });
    });
    test('returns an error when ticket data is invalid', async () => {
      return dsl.tickets
        .authenticatedAs(jwtAccessToken)
        .create({
          title: '',
          description: '',
        })
        .expect(400)
        .expect({
          statusCode: 400,
          message: [
            'title should not be empty',
            'description should not be empty',
          ],
          error: 'Bad Request',
        });
    });
  });
});
