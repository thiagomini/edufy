import { INestApplication } from '@nestjs/common';
import { Jwt } from '@src/libs/jwt/jwt';
import { DSL, createDSL } from '@test/dsl/dsl.factory';
import { workflows } from '@test/dsl/workflows';
import { response } from '@test/utils/response';
import { createTestingApp } from '@test/utils/testing-app.factory';

describe('Get All Courses (e2e)', () => {
  let app: INestApplication;
  let dsl: DSL;
  let instructorUserJwt: Jwt;

  beforeAll(async () => {
    app = await createTestingApp();
    dsl = createDSL(app);
    instructorUserJwt = await workflows(dsl).createUserWithRole('instructor');
  });

  beforeEach(async () => {
    await dsl.courses.deleteAllCourses();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('success cases', () => {
    test('returns an empty list when no courses exist', async () => {
      await dsl.courses
        .authenticatedAs(instructorUserJwt)
        .getAll()
        .expect(200)
        .expect([]);
    });
    test('returns a list of courses', async () => {
      await dsl.courses.authenticatedAs(instructorUserJwt).createMany([
        {
          title: 'Course 1',
          description: 'Description for Course 1',
          price: 100,
        },
        {
          title: 'Course 2',
          description: 'Description for Course 2',
          price: 200,
        },
      ]);

      return dsl.courses
        .authenticatedAs(instructorUserJwt)
        .getAll()
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(2);
          expect(res.body).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                title: 'Course 1',
                description: 'Description for Course 1',
                price: 100,
              }),
              expect.objectContaining({
                title: 'Course 2',
                description: 'Description for Course 2',
                price: 200,
              }),
            ]),
          );
        });
    });
  });
  describe('error cases', () => {
    test('returns an error when request is unauthenticated', async () => {
      return dsl.courses.getAll().expect(401).expect(response.unauthorized());
    });
  });
});
