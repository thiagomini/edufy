import { INestApplication } from '@nestjs/common';
import { type Jwt } from '@src/libs/jwt/jwt';
import { DSL, createDSL } from '@test/dsl/dsl.factory';
import { workflows } from '@test/dsl/workflows';
import { response } from '@test/utils/response';
import { createTestingApp } from '@test/utils/testing-app.factory';
import { randomUUID } from 'crypto';

describe('Resolve Ticket (e2e)', () => {
  let app: INestApplication;
  let dsl: DSL;
  let supportAgentJwt: Jwt<{ sub: string }>;

  beforeAll(async () => {
    app = await createTestingApp();
    dsl = createDSL(app);
    supportAgentJwt = await workflows(dsl).createUserWithRole('support_agent');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('success cases', () => {
    test('successfully resolves a ticket', async () => {
      const ticket = await dsl.tickets
        .authenticatedAs(supportAgentJwt)
        .create({
          title: 'Test Ticket',
          description: 'This is a test ticket',
        })
        .then((response) => response.body);

      return dsl.tickets
        .authenticatedAs(supportAgentJwt)
        .resolve(ticket.id)
        .expect(200)
        .expect({
          id: ticket.id,
          title: ticket.title,
          description: ticket.description,
          status: 'closed',
          resolvedBy: supportAgentJwt.payload().sub,
          createdBy: ticket.createdBy,
          replies: [],
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
        .authenticatedAs(supportAgentJwt)
        .resolve('invalid-ticket-id')
        .expect(400)
        .expect(response.badRequest('Invalid ticket ID format'));
    });
    test('returns an error when ticket is not found', async () => {
      const randomTicketId = randomUUID();
      return dsl.tickets
        .authenticatedAs(supportAgentJwt)
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
        .authenticatedAs(supportAgentJwt)
        .create({
          title: 'Test Ticket',
          description: 'This is a test ticket',
        })
        .then((response) => response.body);

      // Resolving the ticket to change its status
      await dsl.tickets
        .authenticatedAs(supportAgentJwt)
        .resolve(ticket.id)
        .expect(200);

      return dsl.tickets
        .authenticatedAs(supportAgentJwt)
        .resolve(ticket.id)
        .expect(
          response.badRequest(
            `Ticket with ID ${ticket.id} is not open and cannot be resolved`,
          ),
        );
    });
    test('returns an error when the user does not have permission to resolve the ticket', async () => {
      const commonUserJwt = await dsl.users.createRandomUser();

      return dsl.tickets
        .authenticatedAs(commonUserJwt)
        .resolve(randomUUID())
        .expect(403)
        .expect(
          response.forbidden(
            'You do not have permission to resolve this ticket',
          ),
        );
    });
  });
});
