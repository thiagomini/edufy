import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '@src/app/app.module';
import { Jwt } from '@src/libs/jwt/jwt';
import { configServer } from '@src/server-config';
import { DSL, createDSL } from '@test/dsl/dsl.factory';
import { response } from '@test/utils/response';
import { randomUUID } from 'node:crypto';

describe('Get Purchase By Id (e2e)', () => {
  let app: INestApplication;
  let dsl: DSL;
  let studentAccessToken: Jwt<{ sub: string }>;
  let instructorAccessToken: Jwt<{ sub: string }>;
  let typescriptCourse: {
    id: string;
    title: string;
    description: string;
    price: number;
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configServer(app);
    await app.init();
    dsl = createDSL(app);
    studentAccessToken = await dsl.users.createUserWithRole('student');
    instructorAccessToken = await dsl.users.createUserWithRole('instructor');
    typescriptCourse = await dsl.courses
      .authenticatedAs(instructorAccessToken)
      .create({
        title: 'Typescript Hero',
        description: 'Become a Typescript expert',
        price: 175,
      })
      .expect(201)
      .then((res) => res.body);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('success cases', () => {
    test('returns a purchase by id', async () => {
      // Arrange
      const { id } = await dsl.courses
        .authenticatedAs(studentAccessToken)
        .checkout(typescriptCourse.id)
        .expect(200)
        .then((res) => res.body);

      // Act
      return (
        dsl.courses
          .authenticatedAs(studentAccessToken)
          .getPurchaseById(id)
          // Assert
          .expect(200)
          .expect((res) => {
            expect(res.body).toEqual({
              id,
              course: {
                id: typescriptCourse.id,
                title: typescriptCourse.title,
                description: typescriptCourse.description,
                price: typescriptCourse.price,
                currency: 'BRL',
              },
              purchaseDate: expect.any(String),
              status: 'pending',
            });
          })
      );
    });
  });

  describe('error cases', () => {
    test('returns an error when request is unauthenticated', () => {
      return dsl.courses
        .getPurchaseById(randomUUID())
        .expect(response.unauthorized());
    });
    test('returns an error when purchase ID is invalid', () => {
      return dsl.courses
        .authenticatedAs(studentAccessToken)
        .getPurchaseById('not-really-a-valid-uuid')
        .expect(400)
        .expect(response.badRequest('Invalid purchase ID format'));
    });
    test('returns an error when purchase is not found', () => {
      return dsl.courses
        .authenticatedAs(studentAccessToken)
        .getPurchaseById(randomUUID())
        .expect(404)
        .expect(response.notFound('Purchase not found'));
    });
    test('returns an error when the user does not own the purchase', async () => {
      // Arrange
      const anotherStudentJwt = await dsl.users.createUserWithRole('student');
      const rustCourse = await dsl.courses
        .authenticatedAs(instructorAccessToken)
        .create({
          title: 'Some Rust course',
          description: 'Learn Programming in Rust',
          price: 50,
        })
        .then((res) => res.body);

      const { id: rustCoursePurchase } = await dsl.courses
        .authenticatedAs(anotherStudentJwt)
        .checkout(rustCourse.id)
        .then((res) => res.body);

      // Act
      return (
        dsl.courses
          .authenticatedAs(studentAccessToken)
          .getPurchaseById(rustCoursePurchase)
          // Assert
          .expect(404)
          .expect(response.notFound('Purchase not found'))
      );
    });
  });
});
