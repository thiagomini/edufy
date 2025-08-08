import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '@src/app/app.module';
import { Jwt } from '@src/libs/jwt/jwt';
import { configServer } from '@src/server-config';
import { DSL, createDSL } from '@test/dsl/dsl.factory';
import { response } from '@test/utils/response';
import { randomUUID } from 'node:crypto';

describe('Get Purchase By Id (e2e)', () => {
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
    test.todo('returns a purchase by id');
  });

  describe('error cases', () => {
    test('returns an error when request is unauthenticated', () => {
      return dsl.courses
        .getPurchaseById(randomUUID())
        .expect(response.unauthorized());
    });
    test('returns an error when purchase ID is invalid', () => {
      return dsl.courses
        .authenticatedAs(jwtAccessToken)
        .getPurchaseById('not-really-a-valid-uuid')
        .expect(400)
        .expect(response.badRequest('Invalid purchase ID format'));
    });
    test('returns an error when purchase is not found', () => {
      return dsl.courses
        .authenticatedAs(jwtAccessToken)
        .getPurchaseById(randomUUID())
        .expect(404)
        .expect(response.notFound('Purchase not found'));
    });
  });
});
