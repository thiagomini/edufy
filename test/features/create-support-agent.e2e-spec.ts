import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import { configServer } from '@src/server-config';
import { createDSL, DSL } from '@test/dsl/dsl.factory';

describe('Create support agent (e2e)', () => {
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
    test.todo('successfully creates a support agent');
  });
  describe('error cases', () => {
    test('returns an error when request is not authenticated', async () => {
      return dsl.admin
        .createSupportAgent({
          email: 'test@mail.com',
          name: 'Test Agent',
          password: 'password123',
        })
        .expect(401)
        .expect({
          statusCode: 401,
          message: 'Admin key is missing or malformed',
          error: 'Unauthorized',
        });
    });
    test.todo('returns an error when request admin key is invalid');
    test.todo('returns an error when request input data is invalid');
  });
});
