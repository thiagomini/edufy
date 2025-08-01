import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { configServer } from '../../src/server-config';
import { DSL, createDSL } from '../dsl/dsl.factory';
import { response, validationErrors } from '@test/utils/response';
import { type Jwt } from '@src/libs/jwt/jwt';

describe('Submit Ticket (e2e)', () => {
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
    test('successfully submits a ticket with valid data', async () => {
      const userId = await dsl.users
        .authenticatedAs(jwtAccessToken)
        .me()
        .expect(200)
        .then((response) => response.body.id);
      return dsl.tickets
        .authenticatedAs(jwtAccessToken)
        .create({
          title: 'Test Ticket',
          description: 'This is a test ticket',
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toEqual({
            id: expect.any(String),
            title: 'Test Ticket',
            description: 'This is a test ticket',
            status: 'open',
            createdBy: userId,
          });
        });
    });
  });
  describe('error cases', () => {
    test('returns an error when request is not authenticated', async () => {
      return dsl.tickets
        .create({
          title: 'Test Ticket',
          description: 'This is a test ticket',
        })
        .expect(401)
        .expect(
          response.unauthorized('Authorization header is missing or malformed'),
        );
    });
    test('returns an error when ticket data is invalid', async () => {
      return dsl.tickets
        .authenticatedAs(jwtAccessToken)
        .create({
          title: '',
          description: '',
        })
        .expect(400)
        .expect(
          response.validationFailed([
            validationErrors.isNotEmpty('title'),
            validationErrors.isNotEmpty('description'),
          ]),
        );
    });
  });
});
