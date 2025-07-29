import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import { configServer } from '@src/server-config';
import { DSL, createDSL } from '@test/dsl/dsl.factory';

describe('Resolve Ticket (e2e)', () => {
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
    test.todo('successfully resolves a ticket');
  });

  describe('error cases', () => {
    test('returns an error when request is not authenticated', () => {
      return dsl.tickets.resolve('ticket-id').expect(401).expect({
        statusCode: 401,
        message: 'Authorization header is missing or malformed',
        error: 'Unauthorized',
      });
    });
    test.todo('returns an error when ticket ID is invalid');
    test.todo('returns an error when ticket is not found');
    test.todo(
      'returns an error when trying to resolve a ticket that is not open',
    );
  });
});
