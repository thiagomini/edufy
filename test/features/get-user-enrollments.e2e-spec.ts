import { INestApplication } from '@nestjs/common';
import { DSL, createDSL } from '@test/dsl/dsl.factory';
import { workflows } from '@test/dsl/workflows';
import { response } from '@test/utils/response';
import { createTestingApp } from '@test/utils/testing-app.factory';

describe('Get User Enrollments', () => {
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
    test('returns an empty list when student did not enroll in any course', async () => {
      const studentJwt = await dsl.users.createUserWithRole('student');
      return dsl.users
        .authenticatedAs(studentJwt)
        .getEnrollments()
        .expect(200)
        .expect([]);
    });
    test('returns a list of enrolled courses', async () => {
      // Arrange
      const instructorJwt = await dsl.users.createUserWithRole('instructor');
      const course = await dsl.courses
        .authenticatedAs(instructorJwt)
        .createRandomCourse();

      const studentJwt = await dsl.users.createUserWithRole('student');
      await workflows(dsl).enrollStudentInCourse(studentJwt, course.id);

      // Act
      return (
        dsl.users
          .authenticatedAs(studentJwt)
          .getEnrollments()
          // Assert
          .expect(200)
          .expect((response) => {
            expect(response.body).toEqual([
              {
                courseId: course.id,
                studentId: studentJwt.payload().sub,
                enrolledAt: expect.any(String),
              },
            ]);
          })
      );
    });
  });
  describe('error cases', () => {
    test('returns an error when request is unauthenticated', () => {
      return dsl.users
        .getEnrollments()
        .expect(401)
        .expect(response.unauthorized());
    });
    test('returns an error when requesting user is not a student', async () => {
      const instructorJwt = await dsl.users.createUserWithRole('instructor');

      return dsl.users
        .authenticatedAs(instructorJwt)
        .getEnrollments()
        .expect(403)
        .expect(response.forbidden('Only students can access enrollments'));
    });
  });
});
