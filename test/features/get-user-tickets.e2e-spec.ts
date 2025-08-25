import { INestApplication } from '@nestjs/common';
import { Jwt } from '@src/libs/jwt/jwt';
import { DSL, createDSL } from '@test/dsl/dsl.factory';
import { response } from '@test/utils/response';
import { createTestingApp } from '@test/utils/testing-app.factory';

describe('Get User Tickets', () => {
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
    test('returns an empty array when user has no tickets', async () => {
      return dsl.users
        .authenticatedAs(jwtAccessToken)
        .tickets()
        .expect(200)
        .expect((response) => {
          expect(response.body).toEqual([]);
        });
    });
    test('successfully retrieves all tickets for a user', async () => {
      // Arrange
      const ticket1 = await dsl.support
        .authenticatedAs(jwtAccessToken)
        .createTicket({
          title: 'User Ticket 1',
          description: 'This is a user ticket',
        })
        .then((response) => response.body);
      const ticket2 = await dsl.support
        .authenticatedAs(jwtAccessToken)
        .createTicket({
          title: 'User Ticket 2',
          description: 'This is another user ticket',
        })
        .then((response) => response.body);

      // Act and Assert
      return dsl.users
        .authenticatedAs(jwtAccessToken)
        .tickets()
        .expect(200)
        .expect((response) => {
          expect(response.body).toEqual([ticket1, ticket2]);
        });
    });
  });

  describe('error cases', () => {
    test('returns an error when request is not authenticated', () => {
      return dsl.users.tickets().expect(401).expect(response.unauthorized());
    });
  });
});
