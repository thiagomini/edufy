import { INestApplication } from '@nestjs/common';
import { Jwt } from '@src/libs/jwt/jwt';
import { DSL, createDSL } from '@test/dsl/dsl.factory';
import { response } from '@test/utils/response';
import { createTestingApp } from '@test/utils/testing-app.factory';
import { randomUUID } from 'crypto';

describe('Reply Ticket E2E Tests', () => {
  let app: INestApplication;
  let dsl: DSL;
  let jwtAccessToken: Jwt<{ sub: string }>;
  const DUMMY_TICKET_REPLY = {
    content: 'This is a reply to the ticket',
  };

  beforeAll(async () => {
    app = await createTestingApp();
    dsl = createDSL(app);
    jwtAccessToken = await dsl.users.createRandomUser();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('success cases', () => {
    test('successfully replies to a ticket', async () => {
      // Arrange
      const ticket = await dsl.tickets
        .authenticatedAs(jwtAccessToken)
        .create({
          title: 'Test Ticket',
          description: 'This is a test ticket',
        })
        .then((response) => response.body);

      // Act
      await dsl.tickets
        .authenticatedAs(jwtAccessToken)
        .reply(ticket.id, {
          content: 'This is a reply to the ticket',
        })
        .expect(204);

      // Assert
      return dsl.tickets
        .authenticatedAs(jwtAccessToken)
        .getById(ticket.id)
        .expect(200)
        .expect((response) => {
          expect(response.body).toMatchObject({
            id: ticket.id,
            title: 'Test Ticket',
            description: 'This is a test ticket',
            replies: [
              {
                content: 'This is a reply to the ticket',
                createdBy: jwtAccessToken.payload().sub,
              },
            ],
          });
        });
    });
  });
  describe('error cases', () => {
    test('returns an error when request is not authenticated', () => {
      return dsl.tickets
        .reply(randomUUID(), DUMMY_TICKET_REPLY)
        .expect(401)
        .expect(response.unauthorized());
    });
    test('returns an error when ticket ID is invalid', () => {
      return dsl.tickets
        .authenticatedAs(jwtAccessToken)
        .reply('invalid-id', DUMMY_TICKET_REPLY)
        .expect(400)
        .expect(response.badRequest('Invalid ticket ID format'));
    });
    test('returns an error when data is invalid', () => {
      return dsl.tickets
        .authenticatedAs(jwtAccessToken)
        .reply(randomUUID(), {
          content: '',
        })
        .expect(400)
        .expect(response.validationFailed(['content should not be empty']));
    });
    test('returns an error when ticket does not exist', () => {
      const nonExistentTicketId = randomUUID();
      return dsl.tickets
        .authenticatedAs(jwtAccessToken)
        .reply(nonExistentTicketId, DUMMY_TICKET_REPLY)
        .expect(404)
        .expect(
          response.notFound(`Ticket with ID ${nonExistentTicketId} not found`),
        );
    });
    test('returns an error when ticket is closed', async () => {
      const ticket = await dsl.tickets
        .authenticatedAs(jwtAccessToken)
        .create({
          title: 'Closed Ticket',
          description: 'This ticket will be closed before replying',
        })
        .expect(201)
        .then((response) => response.body);
      await dsl.tickets
        .authenticatedAs(jwtAccessToken)
        .resolve(ticket.id)
        .expect(200);

      return dsl.tickets
        .authenticatedAs(jwtAccessToken)
        .reply(ticket.id, DUMMY_TICKET_REPLY)
        .expect(400)
        .expect(
          response.badRequest(
            `Ticket with ID ${ticket.id} is not open and cannot be replied to`,
          ),
        );
    });
  });
});
