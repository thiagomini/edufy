import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@src/app/app.module';
import { Jwt } from '@src/libs/jwt/jwt';
import { configServer } from '@src/server-config';
import { DSL, createDSL } from '@test/dsl/dsl.factory';
import { response } from '@test/utils/response';
import { randomUUID } from 'node:crypto';

describe('Get Ticket E2E Tests', () => {
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
    test.todo('successfully retrieves a ticket with valid ID');
  });
  describe('error cases', () => {
    test('returns an error when request is not authenticated', () => {
      return dsl.tickets
        .getTicketById(randomUUID())
        .expect(401)
        .expect(response.unauthorized());
    });
    test('returns an error when ticket ID is invalid', () => {
      return dsl.tickets
        .authenticatedAs(jwtAccessToken)
        .getTicketById('invalid-id')
        .expect(400)
        .expect(response.badRequest('Invalid ticket ID format'));
    });
    test('returns an error when ticket does not exist', () => {
      const nonExistingTicketId = randomUUID();
      return dsl.tickets
        .authenticatedAs(jwtAccessToken)
        .getTicketById(nonExistingTicketId)
        .expect(404)
        .expect(
          response.notFound(`Ticket with ID ${nonExistingTicketId} not found`),
        );
    });
  });
});
