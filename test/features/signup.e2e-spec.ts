import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import { configServer } from '@src/server-config';
import { SignupUserDto } from '@src/user/presentation/signup-user.dto';
import { createDSL, DSL } from '@test/dsl/dsl.factory';
import { response, validationErrors } from '@test/utils/response';

describe('Signup (e2e)', () => {
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
    test('successfully signs up a user with valid data', async () => {
      const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
      const signupUserData = buildSignupUserData({
        name: 'John Doe',
        email: 'john@doe.com',
        password: 'password123',
      });

      const response = await dsl.users.createUser(signupUserData).expect(201);

      expect(response.body).toEqual({
        jwtAccessToken: expect.stringMatching(jwtRegex),
      });
      return dsl.users
        .authenticatedAs(response.body.jwtAccessToken)
        .me()
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id: expect.any(String),
            name: signupUserData.name,
            email: signupUserData.email,
            role: null,
          });
        });
    });
  });
  describe('error cases', () => {
    test('returns an error when signup data is invalid', async () => {
      return dsl.users
        .createUser({
          name: '',
          email: 'invalid-email',
          password: 'short',
        })
        .expect(400)
        .expect(
          response.validationFailed([
            validationErrors.isNotEmpty('name'),
            validationErrors.isEmail('email'),
            validationErrors.minLength('password', 8),
          ]),
        );
    });
    test('returns an error when email is already in use', async () => {
      const email = 'existing@mail.com';
      const signupData = buildSignupUserData({ email });
      await dsl.users.createUser(signupData).expect(201);

      return dsl.users
        .createUser(
          buildSignupUserData({
            email,
            name: 'Another User',
          }),
        )
        .expect(409)
        .expect(response.conflict('Email already in use'));
    });
  });
});

function buildSignupUserData(
  overrides: Partial<SignupUserDto> = {},
): SignupUserDto {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email({
      allowSpecialCharacters: true,
    }),
    password: faker.internet.password({ length: 8 }),
    ...overrides,
  };
}
