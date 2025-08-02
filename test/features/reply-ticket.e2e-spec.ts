import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '@src/app/app.module';
import { Jwt } from '@src/libs/jwt/jwt';
import { configServer } from '@src/server-config';
import { DSL, createDSL } from '@test/dsl/dsl.factory';
import { response } from '@test/utils/response';
import { randomUUID } from 'crypto';

describe('Reply Ticket E2E Tests', () => {
  let app: INestApplication;
  let dsl: DSL;
  let jwtAccessToken: Jwt<{ sub: string }>;
  const DUMMY_TICKET_REPLY = {
    content: 'This is a reply to the ticket',
  };

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
    test.todo('successfully replies to a ticket');
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
