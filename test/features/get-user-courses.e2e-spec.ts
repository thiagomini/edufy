import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '@src/app/app.module';
import { Jwt } from '@src/libs/jwt/jwt';
import { configServer } from '@src/server-config';
import { DSL, createDSL } from '@test/dsl/dsl.factory';
import { response } from '@test/utils/response';

describe('Get User Courses (e2e)', () => {
  let app: INestApplication;
  let dsl: DSL;
  let jwtAccessToken: Jwt<{ sub: string }>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configServer(app);
    await app.init();
    dsl = createDSL(app);
    jwtAccessToken = await dsl.users.createUserWithRole('instructor');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('success cases', () => {
    test('returns an empty list when user has no courses', async () => {
      return dsl.courses
        .authenticatedAs(jwtAccessToken)
        .getLecturedByUser(jwtAccessToken.payload().sub)
        .expect(200)
        .expect([]);
    });
    test('successfully retrieves courses lectured by an instructor', async () => {
      // Arrange
      const course = await dsl.courses
        .authenticatedAs(jwtAccessToken)
        .create({
          title: 'Test Course',
          description: 'This is a test course',
          price: 100,
        })
        .expect(201)
        .then((response) => response.body);

      // Act
      return dsl.courses
        .authenticatedAs(jwtAccessToken)
        .getLecturedByUser(jwtAccessToken.payload().sub)
        .expect(200)
        .expect((response) => {
          expect(response.body).toEqual([
            {
              id: course.id,
              title: 'Test Course',
              description: 'This is a test course',
              price: 100,
              instructorId: jwtAccessToken.payload().sub,
            },
          ]);
        });
    });
  });
  describe('error cases', () => {
    test('returns an error when request is not authenticated', () => {
      return dsl.courses
        .getLecturedByUser(jwtAccessToken.payload().sub)
        .expect(401)
        .expect(response.unauthorized());
    });
  });
});
