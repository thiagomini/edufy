import { INestApplication } from '@nestjs/common';
import { Jwt } from '@src/libs/jwt/jwt';
import { DSL, createDSL } from '@test/dsl/dsl.factory';
import { workflows } from '@test/dsl/workflows';
import { response } from '@test/utils/response';
import { createTestingApp } from '@test/utils/testing-app.factory';
import { randomUUID } from 'crypto';

describe('Get Course by ID (e2e)', () => {
  let app: INestApplication;
  let dsl: DSL;
  let jwtAccessToken: Jwt<{ sub: string }>;

  beforeAll(async () => {
    app = await createTestingApp();
    dsl = createDSL(app);
    jwtAccessToken = await workflows(dsl).createUserWithRole('instructor');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('success cases', () => {
    test('successfully retrieves a course by valid ID', async () => {
      const course = await dsl.courses
        .authenticatedAs(jwtAccessToken)
        .create({
          title: 'Test Course',
          description: 'This is a test course',
          price: 100,
        })
        .expect(201)
        .then((response) => response.body);

      return dsl.courses
        .authenticatedAs(jwtAccessToken)
        .getById(course.id)
        .expect(200)
        .expect((response) => {
          expect(response.body).toEqual({
            id: course.id,
            title: 'Test Course',
            description: 'This is a test course',
            price: 100,
            instructorId: jwtAccessToken.payload().sub,
          });
        });
    });
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
        .authenticatedAs(jwtAccessToken)
        .getById('Invalid course ID format')
        .expect(400);
    });
    test('returns an error when course does not exist', () => {
      return dsl.courses
        .authenticatedAs(jwtAccessToken)
        .getById(randomUUID())
        .expect(404)
        .expect(response.notFound('Course not found'));
    });
  });
});
