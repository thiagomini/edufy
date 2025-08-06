import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '@src/app/app.module';
import { Jwt } from '@src/libs/jwt/jwt';
import { configServer } from '@src/server-config';
import { DSL, createDSL } from '@test/dsl/dsl.factory';
import { response } from '@test/utils/response';
import { isURL } from 'class-validator';
import { randomUUID } from 'node:crypto';

describe('Checkout Course (e2e)', () => {
  let app: INestApplication;
  let dsl: DSL;
  let studentUserJwt: Jwt;
  let instructorUserJwt: Jwt;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configServer(app);
    await app.init();
    dsl = createDSL(app);
    studentUserJwt = await dsl.users.createUserWithRole('student');
    instructorUserJwt = await dsl.users.createUserWithRole('instructor');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('success cases', () => {
    test('successfully starts the checkout process for a course', async () => {
      // Arrange
      const { id } = await dsl.courses
        .authenticatedAs(instructorUserJwt)
        .create({
          title: 'Python Programming',
          description: 'Learn Python from scratch',
          price: 200,
        })
        .expect(201)
        .then((res) => res.body);

      // Act
      return dsl.courses
        .authenticatedAs(studentUserJwt)
        .checkout(id)
        .expect(200)
        .expect((res) => {
          const checkoutUrl = res.body.checkoutUrl;
          expect(checkoutUrl).toBeTruthy();
          const isValid = isURL(checkoutUrl);
          expect(isValid).toBe(true);
        });
    });
  });

  describe('error cases', () => {
    test('returns an error when request is unauthenticated', () => {
      return dsl.courses
        .checkout('course-id')
        .expect(401)
        .expect(response.unauthorized());
    });
    test('returns an error when course id is invalid', () => {
      return dsl.courses
        .authenticatedAs(studentUserJwt)
        .checkout('invalid-id')
        .expect(400)
        .expect(response.badRequest('Invalid course ID format'));
    });
    test('returns an error when course does not exist', async () => {
      return dsl.courses
        .authenticatedAs(studentUserJwt)
        .checkout(randomUUID())
        .expect(404)
        .expect(response.notFound('Course not found'));
    });
    test.todo('returns an error when user has already bought the course');
  });
});
