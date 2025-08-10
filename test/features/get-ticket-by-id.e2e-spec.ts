import { INestApplication } from '@nestjs/common';
import { Jwt } from '@src/libs/jwt/jwt';
import { DSL, createDSL } from '@test/dsl/dsl.factory';
import { response } from '@test/utils/response';
import { createTestingApp } from '@test/utils/testing-app.factory';
import { randomUUID } from 'node:crypto';

describe('Get Ticket E2E Tests', () => {
  let app: INestApplication;
  let dsl: DSL;
  let jwtAccessToken: Jwt<{ sub: string }>;

  beforeAll(async () => {
    app = await createTestingApp();
    dsl = createDSL(app);
    jwtAccessToken = await dsl.users.createRandomUser();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('success cases', () => {
    test('successfully retrieves a ticket with valid ID', async () => {
      const ticket = await dsl.tickets
        .authenticatedAs(jwtAccessToken)
        .create({
          title: 'Test Ticket',
          description: 'This is a test ticket',
        })
        .then((response) => response.body);

      return dsl.tickets
        .authenticatedAs(jwtAccessToken)
        .getById(ticket.id)
        .expect(200)
        .expect((response) => {
          expect(response.body).toEqual({
            id: ticket.id,
            title: 'Test Ticket',
            description: 'This is a test ticket',
            status: ticket.status,
            createdBy: ticket.createdBy,
            resolvedBy: null,
            replies: [],
          });
        });
    });
  });
  describe('error cases', () => {
    test('returns an error when request is not authenticated', () => {
      return dsl.tickets
        .getById(randomUUID())
        .expect(401)
        .expect(response.unauthorized());
    });
    test('returns an error when ticket ID is invalid', () => {
      return dsl.tickets
        .authenticatedAs(jwtAccessToken)
        .getById('invalid-id')
        .expect(400)
        .expect(response.badRequest('Invalid ticket ID format'));
    });
    test('returns an error when ticket does not exist', () => {
      const nonExistingTicketId = randomUUID();
      return dsl.tickets
        .authenticatedAs(jwtAccessToken)
        .getById(nonExistingTicketId)
        .expect(404)
        .expect(
          response.notFound(`Ticket with ID ${nonExistingTicketId} not found`),
        );
    });
  });
});
