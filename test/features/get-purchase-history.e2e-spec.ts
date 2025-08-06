import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '@src/app/app.module';
import { Jwt } from '@src/libs/jwt/jwt';
import { configServer } from '@src/server-config';
import { DSL, createDSL } from '@test/dsl/dsl.factory';
import { response } from '@test/utils/response';

describe('Get Purchase History (e2e)', () => {
  let app: INestApplication;
  let dsl: DSL;
  let _studentUserJwt: Jwt;
  let instructorUserJwt: Jwt;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configServer(app);
    await app.init();
    dsl = createDSL(app);
    _studentUserJwt = await dsl.users.createUserWithRole('student');
    instructorUserJwt = await dsl.users.createUserWithRole('instructor');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('success cases', () => {
    test.todo('returns an empty list when no purchases exist');
    test.todo('returns a list of purchases for the authenticated student');
  });
  describe('error cases', () => {
    test('returns an error when request is unauthenticated', () => {
      return dsl.users
        .getPurchaseHistory()
        .expect(401)
        .expect(response.unauthorized());
    });
    test('returns an error when user is not a student', async () => {
      return dsl.users
        .authenticatedAs(instructorUserJwt)
        .getPurchaseHistory()
        .expect(403)
        .expect(
          response.forbidden('Only students can access purchase history'),
        );
    });
  });
});
