import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import { type Jwt } from '@src/libs/jwt/jwt';
import { configServer } from '@src/server-config';
import { DSL, createDSL } from '@test/dsl/dsl.factory';
import { response } from '@test/utils/response';
import { randomUUID } from 'crypto';

describe('Resolve Ticket (e2e)', () => {
  let app: INestApplication;
  let dsl: DSL;
  let jwtAccessToken: Jwt<{ sub: string }>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configServer(app);
    await app.init();
    dsl = createDSL(app);
    jwtAccessToken = await dsl.users.createRandomUser();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('success cases', () => {
    test('successfully resolves a ticket', async () => {
      const ticket = await dsl.tickets
        .authenticatedAs(jwtAccessToken)
        .create({
          title: 'Test Ticket',
          description: 'This is a test ticket',
        })
        .then((response) => response.body);

      return dsl.tickets
        .authenticatedAs(jwtAccessToken)
        .resolve(ticket.id)
        .expect(201)
        .expect({
          id: ticket.id,
          title: ticket.title,
          description: ticket.description,
          status: 'closed',
          resolvedBy: jwtAccessToken.payload().sub,
        });
    });
  });

  describe('error cases', () => {
    test('returns an error when request is not authenticated', () => {
      return dsl.tickets
        .resolve('ticket-id')
        .expect(401)
        .expect(
          response.unauthorized('Authorization header is missing or malformed'),
        );
    });
    test('returns an error when ticket ID is invalid', () => {
      return dsl.tickets
        .authenticatedAs(jwtAccessToken)
        .resolve('invalid-ticket-id')
        .expect(400)
        .expect(response.badRequest('Invalid ticket ID format'));
    });
    test('returns an error when ticket is not found', async () => {
      const randomTicketId = randomUUID();
      return dsl.tickets
        .authenticatedAs(jwtAccessToken)
        .resolve(randomTicketId)
        .expect(404)
        .expect({
          statusCode: 404,
          error: 'Not Found',
          message: `Ticket with ID ${randomTicketId} not found`,
        });
    });
    test('returns an error when trying to resolve a ticket that is not open', async () => {
      const ticket = await dsl.tickets
        .authenticatedAs(jwtAccessToken)
        .create({
          title: 'Test Ticket',
          description: 'This is a test ticket',
        })
        .then((response) => response.body);

      // Resolving the ticket to change its status
      await dsl.tickets
        .authenticatedAs(jwtAccessToken)
        .resolve(ticket.id)
        .expect(201);

      return dsl.tickets
        .authenticatedAs(jwtAccessToken)
        .resolve(ticket.id)
        .expect(
          response.badRequest(
            `Ticket with ID ${ticket.id} is not open and cannot be resolved`,
          ),
        );
    });
    test.todo(
      'returns an error when the user does not have permission to resolve the ticket',
    );
  });
});
