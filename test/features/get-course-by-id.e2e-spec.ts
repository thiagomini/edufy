import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '@src/app/app.module';
import { Jwt } from '@src/libs/jwt/jwt';
import { configServer } from '@src/server-config';
import { DSL, createDSL } from '@test/dsl/dsl.factory';
import { response } from '@test/utils/response';
import { randomUUID } from 'crypto';

describe('Get Course by ID (e2e)', () => {
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
    test.todo('successfully retrieves a course by valid ID');
  });
  describe('error cases', () => {
    test('returns an error when request is not authenticated', () => {
      return dsl.courses
        .getById(randomUUID())
        .expect(401)
        .expect(response.unauthorized());
    });
    test('returns an error when course ID is invalid', () => {
      return dsl.courses
        .authenticatedAs(_jwtAccessToken)
        .getById('Invalid course ID format')
        .expect(400);
    });
    test.todo('returns an error when course does not exist');
  });
});
