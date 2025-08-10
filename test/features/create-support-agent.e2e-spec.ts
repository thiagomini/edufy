import { INestApplication } from '@nestjs/common';
import { createDSL, DSL } from '@test/dsl/dsl.factory';
import { response, validationErrors } from '@test/utils/response';
import { createTestingApp } from '@test/utils/testing-app.factory';

describe('Create support agent (e2e)', () => {
  let app: INestApplication;
  let dsl: DSL;
  let adminKey: string;

  beforeAll(async () => {
    app = await createTestingApp();
    dsl = createDSL(app);
    adminKey = dsl.config.admin.key;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('success cases', () => {
    test('successfully creates a support agent', async () => {
      const supportAgentData = await dsl.admin
        .usingAdminKey(adminKey)
        .createSupportAgent({
          email: 'test@mail.com',
          name: 'Test Agent',
          password: 'password123',
        })
        .expect(201)
        .then((response) => response.body);

      expect(supportAgentData).toEqual({
        id: expect.any(String),
        email: 'test@mail.com',
        name: 'Test Agent',
      });

      // Verify the agent can log in
      const token = await dsl.users
        .login({
          email: 'test@mail.com',
          password: 'password123',
        })
        .expect(200)
        .then((response) => response.body.jwtAccessToken);

      // Verify the agent role
      return dsl.users
        .authenticatedAs(token)
        .me()
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual({
            id: supportAgentData.id,
            email: supportAgentData.email,
            name: supportAgentData.name,
            role: 'support_agent',
            biography: null,
            interests: [],
            profilePictureUrl: null,
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
        .expect(response.unauthorized('Admin key is missing or malformed'));
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
        .expect(response.unauthorized('Invalid admin key'));
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
        .expect(
          response.validationFailed([
            validationErrors.isNotEmpty('name'),
            validationErrors.isEmail('email'),
            validationErrors.minLength('password', 8),
          ]),
        );
    });
  });
});
