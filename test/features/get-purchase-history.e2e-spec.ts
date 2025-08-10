import { INestApplication } from '@nestjs/common';
import { Jwt } from '@src/libs/jwt/jwt';
import { DSL, createDSL } from '@test/dsl/dsl.factory';
import { response } from '@test/utils/response';
import { createTestingApp } from '@test/utils/testing-app.factory';

describe('Get Purchase History (e2e)', () => {
  let app: INestApplication;
  let dsl: DSL;
  let studentUserJwt: Jwt;
  let instructorUserJwt: Jwt;

  beforeAll(async () => {
    app = await createTestingApp();
    dsl = createDSL(app);
    studentUserJwt = await dsl.users.createUserWithRole('student');
    instructorUserJwt = await dsl.users.createUserWithRole('instructor');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('success cases', () => {
    test('returns an empty list when no purchases exist', () => {
      return dsl.users
        .authenticatedAs(studentUserJwt)
        .getPurchaseHistory()
        .expect(200)
        .expect([]);
    });
    test('returns a list of purchases for the authenticated student', async () => {
      const { id: javaCourseId } = await dsl.courses
        .authenticatedAs(instructorUserJwt)
        .create({
          title: 'Java Programming',
          description: 'Learn Java from scratch',
          price: 250,
        })
        .then((res) => res.body);

      await dsl.courses
        .authenticatedAs(studentUserJwt)
        .checkout(javaCourseId)
        .expect(200);

      return dsl.users
        .authenticatedAs(studentUserJwt)
        .getPurchaseHistory()
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual([
            {
              id: expect.any(String),
              userId: studentUserJwt.payload().id,
              course: {
                id: javaCourseId,
                title: 'Java Programming',
                description: 'Learn Java from scratch',
                price: 250,
                currency: 'BRL',
              },
              purchaseDate: expect.any(String),
              status: 'pending',
            },
          ]);
        });
    });
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
