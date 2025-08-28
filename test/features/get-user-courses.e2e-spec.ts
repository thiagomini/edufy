import { INestApplication } from '@nestjs/common';
import { Jwt } from '@src/libs/jwt/jwt';
import { DSL, createDSL } from '@test/dsl/dsl.factory';
import { workflows } from '@test/dsl/workflows';
import { response } from '@test/utils/response';
import { createTestingApp } from '@test/utils/testing-app.factory';
import { waitFor } from '@test/utils/wait-for';

describe('Get User Courses (e2e)', () => {
  let app: INestApplication;
  let dsl: DSL;
  let instructorJwtAccessToken: Jwt<{ sub: string }>;

  beforeAll(async () => {
    app = await createTestingApp();
    dsl = createDSL(app);
    instructorJwtAccessToken =
      await workflows(dsl).createUserWithRole('instructor');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('success cases', () => {
    test('returns an empty list when user has no courses', async () => {
      return dsl.courses
        .authenticatedAs(instructorJwtAccessToken)
        .getAllByUser()
        .expect(200)
        .expect([]);
    });
    test('successfully retrieves courses lectured by an instructor', async () => {
      // Arrange
      const course = await dsl.courses
        .authenticatedAs(instructorJwtAccessToken)
        .create({
          title: 'Test Course',
          description: 'This is a test course',
          price: 100,
        })
        .expect(201)
        .then((response) => response.body);

      // Act
      return dsl.courses
        .authenticatedAs(instructorJwtAccessToken)
        .getAllByUser()
        .expect(200)
        .expect((response) => {
          expect(response.body).toEqual([
            {
              id: course.id,
              title: 'Test Course',
              description: 'This is a test course',
              price: 100,
              instructorId: instructorJwtAccessToken.payload().sub,
            },
          ]);
        });
    });
    test('successfully retrieves courses enrolled by a student', async () => {
      // Arrange
      const course = await dsl.courses
        .authenticatedAs(instructorJwtAccessToken)
        .create({
          title: 'Another Test Course',
          description: 'This is another test course',
          price: 100,
        })
        .expect(201)
        .then((response) => response.body);
      const studentJwt = await workflows(dsl).createUserWithRole('student');
      await workflows(dsl).enrollStudentInCourse(studentJwt, course.id);

      // Act
      await waitFor(() => {
        dsl.courses
          .authenticatedAs(studentJwt)
          .getAllByUser()
          .expect(200)
          .expect((response) => {
            expect(response.body).toEqual([
              {
                id: course.id,
                title: 'Another Test Course',
                description: 'This is another test course',
                price: 100,
                instructorId: instructorJwtAccessToken.payload().sub,
              },
            ]);
          });
      });
    });
  });
  describe('error cases', () => {
    test('returns an error when request is not authenticated', () => {
      return dsl.courses
        .getAllByUser()
        .expect(401)
        .expect(response.unauthorized());
    });
    test('returns an error when user is not an instructor nor a student', async () => {
      const supportAgentJwt =
        await workflows(dsl).createUserWithRole('support_agent');

      return dsl.courses
        .authenticatedAs(supportAgentJwt)
        .getAllByUser()
        .expect(403)
        .expect(
          response.forbidden(
            'Only students or instructors have access to owned courses',
          ),
        );
    });
  });
});
