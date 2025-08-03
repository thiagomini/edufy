import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '@src/app/app.module';
import { configServer } from '@src/server-config';
import { DSL, createDSL } from '@test/dsl/dsl.factory';
import { response } from '@test/utils/response';

describe('Create Course E2E Tests', () => {
  let app: INestApplication;
  let dsl: DSL;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configServer(app);
    await app.init();
    dsl = createDSL(app);
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
    test.todo('returns an error when user is not an instructor');
    test.todo('returns an error when course data is invalid');
  });
});
