import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '@src/app/app.module';
import { Jwt } from '@src/libs/jwt/jwt';
import { configServer } from '@src/server-config';
import { DSL, createDSL } from '@test/dsl/dsl.factory';
import { response, validationErrors } from '@test/utils/response';

describe('Create Course E2E Tests', () => {
  let app: INestApplication;
  let dsl: DSL;
  let instructorUserJwt: Jwt;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configServer(app);
    await app.init();
    dsl = createDSL(app);
    instructorUserJwt = await dsl.users.createUserWithRole('instructor');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('success cases', () => {
    test.todo('successfully creates a course');
  });
  describe('error cases', () => {
    test('returns an error when request is unauthenticated', () => {
      return dsl.courses
        .create({
          title: 'New Course',
          description: 'Course description',
          price: 100,
        })
        .expect(401)
        .expect(response.unauthorized());
    });
    test('returns an error when course data is invalid', () => {
      return dsl.courses
        .authenticatedAs(instructorUserJwt)
        .create({
          title: '',
          description: '',
          price: -10,
        })
        .expect(400)
        .expect(
          response.validationFailed([
            validationErrors.isNotEmpty('title'),
            validationErrors.isNotEmpty('description'),
            validationErrors.isPositive('price'),
          ]),
        );
    });
    test('returns an error when user is not an instructor', async () => {
      const studentUserJwt = await dsl.users.createUserWithRole('student');

      return dsl.courses
        .authenticatedAs(studentUserJwt)
        .create({
          title: 'New Course',
          description: 'Course description',
          price: 100,
        })
        .expect(403)
        .expect({
          statusCode: 403,
          error: 'Forbidden',
          message: 'You do not have permission to create a course',
        });
    });
  });
});
