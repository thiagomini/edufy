import { INestApplication } from '@nestjs/common';
import { DSL, createDSL } from '@test/dsl/dsl.factory';
import { response, validationErrors } from '@test/utils/response';
import { createTestingApp } from '@test/utils/testing-app.factory';

describe('Self-Assign Role (e2e)', () => {
  let app: INestApplication;
  let dsl: DSL;

  beforeAll(async () => {
    app = await createTestingApp();
    dsl = createDSL(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('success cases', () => {
    test('successfully assigns a student role', async () => {
      const jwtAccessToken = await dsl.users.createRandomUser();
      await dsl.users
        .authenticatedAs(jwtAccessToken)
        .selfAssignRole('student')
        .expect(204);

      return dsl.users
        .authenticatedAs(jwtAccessToken)
        .me()
        .expect(200)
        .then((response) => {
          expect(response.body.role).toBe('student');
        });
    });
    test('successfully assigns an instructor role', async () => {
      const jwtAccessToken = await dsl.users.createRandomUser();
      await dsl.users
        .authenticatedAs(jwtAccessToken)
        .selfAssignRole('instructor')
        .expect(204);

      return dsl.users
        .authenticatedAs(jwtAccessToken)
        .me()
        .expect(200)
        .then((response) => {
          expect(response.body.role).toBe('instructor');
        });
    });
  });
  describe('error cases', () => {
    test('returns an error when request is not authenticated', async () => {
      return dsl.users
        .selfAssignRole('student')
        .expect(401)
        .expect(response.unauthorized());
    });
    test('returns an error when input is invalid', async () => {
      const jwtAccessToken = await dsl.users.createRandomUser();
      return dsl.users
        .authenticatedAs(jwtAccessToken)
        .selfAssignRole('invalid-role')
        .expect(400)
        .expect(
          response.validationFailed([
            validationErrors.oneOfValues('role', ['student', 'instructor']),
          ]),
        );
    });
    test('returns an error when user already has a role', async () => {
      const jwtAccessToken = await dsl.users.createRandomUser();
      await dsl.users
        .authenticatedAs(jwtAccessToken)
        .selfAssignRole('student')
        .expect(204);

      return dsl.users
        .authenticatedAs(jwtAccessToken)
        .selfAssignRole('instructor')
        .expect(409)
        .expect(
          response.conflict('User already has a "student" role assigned'),
        );
    });
  });
});
