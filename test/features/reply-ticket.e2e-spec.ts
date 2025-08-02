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
  let _jwtAccessToken: Jwt<{ sub: string }>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configServer(app);
    await app.init();
    dsl = createDSL(app);
    _jwtAccessToken = await dsl.users.createRandomUser();
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
        .reply(randomUUID())
        .expect(401)
        .expect(response.unauthorized());
    });
    test.todo('returns an error when ticket ID is invalid');
    test.todo('returns an error when ticket does not exist');
    test.todo('returns an error when data is invalid');
    test.todo('returns an error when ticket is closed');
  });
});
