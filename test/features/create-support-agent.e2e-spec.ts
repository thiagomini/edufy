import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import { configServer } from '@src/server-config';
import { createDSL, DSL } from '@test/dsl/dsl.factory';

describe('Create support agent (e2e)', () => {
  let app: INestApplication;
  let dsl: DSL;
  let adminKey: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configServer(app);
    await app.init();
    dsl = createDSL(app);
    adminKey = dsl.config.admin.key;
  });

  describe('success cases', () => {
    test('successfully creates a support agent', async () => {
      return dsl.admin
        .usingAdminKey(adminKey)
        .createSupportAgent({
          email: 'test@mail.com',
          name: 'Test Agent',
          password: 'password123',
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toEqual({
            id: expect.any(String),
            email: 'test@mail.com',
            name: 'Test Agent',
          });
        });
    });
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
    test('returns an error when request admin key is invalid', async () => {
      const wrongAdminKey = 'wrong-admin-key';
      return dsl.admin
        .usingAdminKey(wrongAdminKey)
        .createSupportAgent({
          email: 'test@mail.com',
          name: 'Test Agent',
          password: 'password123',
        })
        .expect(401)
        .expect({
          statusCode: 401,
          message: 'Invalid admin key',
          error: 'Unauthorized',
        });
    });
    test('returns an error when request input data is invalid', async () => {
      return dsl.admin
        .usingAdminKey(adminKey)
        .createSupportAgent({
          name: '',
          email: 'wrong-email-format',
          password: 'short',
        })
        .expect(400)
        .expect({
          statusCode: 400,
          message: [
            'name should not be empty',
            'email must be an email',
            'password must be longer than or equal to 8 characters',
          ],
          error: 'Bad Request',
        });
    });
  });
});
