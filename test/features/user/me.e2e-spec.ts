import { INestApplication } from '@nestjs/common';
import { DSL, createDSL } from '../../dsl/dsl.factory';
import { response } from '@test/utils/response';
import { createTestingApp } from '@test/utils/testing-app.factory';
import { workflows } from '@test/dsl/workflows';

describe('Me (e2e)', () => {
  let app: INestApplication;
  let dsl: DSL;

  beforeAll(async () => {
    app = await createTestingApp();
    dsl = createDSL(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('success cases', () => {
    test('returns user data when authenticated', async () => {
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
            role: null, // Role is unset for new users. They decide their role later (student or instructor)
            biography: null,
            interests: [],
            profilePictureUrl: null,
          });
        });
    });
    test('returns 0 tickets resolved for a support agent', async () => {
      const jwt = await workflows(dsl).createUserWithRole('support_agent');

      await dsl.users
        .authenticatedAs(jwt)
        // 2. Enviar uma request GET para o endpoint /users/me
        .me()
        .expect(200)
        .then((response) => {
          // 3. Esperamos que no body da requisicao exista um atributo chamado ticketsResolved = 0
          expect(response.body).toMatchObject({
            ticketsResolved: 0,
          });
        });
    });
    test('returns 1 tickets resolved for a support agent', async () => {
      const instructorJwt =
        await workflows(dsl).createUserWithRole('instructor');

      const ticketId = await dsl.support
        .authenticatedAs(instructorJwt)
        .createTicket({
          title: 'Ticket Test',
          description: 'Ticket Description',
        })
        .then((res) => res.body.id);

      const supportAgentJwt =
        await workflows(dsl).createUserWithRole('support_agent');
      await dsl.support
        .authenticatedAs(supportAgentJwt)
        .resolveTicket(ticketId);

      await dsl.users
        .authenticatedAs(supportAgentJwt)
        // 2. Enviar uma request GET para o endpoint /users/me
        .me()
        .expect(200)
        .then((response) => {
          // 3. Esperamos que no body da requisicao exista um atributo chamado ticketsResolved = 0
          expect(response.body).toMatchObject({
            ticketsResolved: 1,
          });
        });
    });
  });

  describe('error cases', () => {
    test('returns an error when request is not authenticated', () => {
      return dsl.users
        .me()
        .expect(401)
        .expect(
          response.unauthorized('Authorization header is missing or malformed'),
        );
    });

    test('returns an error when JWT is invalid', () => {
      return dsl.users
        .authenticatedAs('invalid.jwt.token')
        .me()
        .expect(401)
        .expect(response.unauthorized('Invalid JWT token'));
    });
  });
});
