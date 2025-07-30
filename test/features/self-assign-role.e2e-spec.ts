import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import { configServer } from '@src/server-config';
import { DSL, createDSL } from '@test/dsl/dsl.factory';
import { response } from '@test/utils/response';

describe('Self-Assign Role (e2e)', () => {
  let app: INestApplication;
  let dsl: DSL;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configServer(app);
    await app.init();
    dsl = createDSL(app);
  });

  describe('success cases', () => {
    test.todo('successfully assigns a student role');
    test.todo('successfully assigns an instructor role');
  });
  describe('error cases', () => {
    test('returns an error when request is not authenticated', async () => {
      return dsl.users
        .selfAssignRole('student')
        .expect(401)
        .expect(response.unauthorized());
    });
    test.todo('returns an error when input is invalid');
    test.todo('returns an error when user already has a role');
  });
});
