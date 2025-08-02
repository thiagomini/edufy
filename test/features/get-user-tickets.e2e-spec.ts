import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '@src/app/app.module';
import { Jwt } from '@src/libs/jwt/jwt';
import { configServer } from '@src/server-config';
import { DSL, createDSL } from '@test/dsl/dsl.factory';
import { response } from '@test/utils/response';

describe('Get User Tickets', () => {
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
      const ticket1 = await dsl.tickets
        .authenticatedAs(jwtAccessToken)
        .create({
          title: 'User Ticket 1',
          description: 'This is a user ticket',
        })
        .then((response) => response.body);
      const ticket2 = await dsl.tickets
        .authenticatedAs(jwtAccessToken)
        .create({
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
