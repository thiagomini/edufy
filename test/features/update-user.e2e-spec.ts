import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '@src/app/app.module';
import { configServer } from '@src/server-config';
import { DSL, createDSL } from '@test/dsl/dsl.factory';
import { response, validationErrors } from '@test/utils/response';

describe('Update User Info', () => {
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
    test('successfully updates user information', async () => {
      const accessToken = await dsl.users.createRandomUser();

      await dsl.users
        .authenticatedAs(accessToken)
        .update({
          name: 'New Name',
          biography: 'Updated biography',
          interests: ['coding', 'testing'],
          profilePictureUrl: 'http://example.com/new-profile.jpg',
        })
        .expect(204);
      return dsl.users
        .authenticatedAs(accessToken)
        .me()
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            id: accessToken.payload().sub,
            name: 'New Name',
            biography: 'Updated biography',
            interests: ['coding', 'testing'],
            profilePictureUrl: 'http://example.com/new-profile.jpg',
          });
        });
    });
  });
  describe('error cases', () => {
    test('return an error when request is not authenticated', () => {
      return dsl.users
        .update({
          name: 'New Name',
          biography: 'Updated biography',
          interests: ['coding', 'testing'],
          profilePictureUrl: 'http://example.com/new-profile.jpg',
        })
        .expect(401)
        .expect(response.unauthorized());
    });
    test('return an error when data is invalid', async () => {
      const accessToken = await dsl.users.createRandomUser({
        name: 'Test User',
      });

      return dsl.users
        .authenticatedAs(accessToken)
        .update({
          name: '',
          profilePictureUrl: 'not-a-valid-url',
        })
        .expect(400)
        .expect(
          response.validationFailed([
            validationErrors.isNotEmpty('name'),
            validationErrors.isUrl('profilePictureUrl'),
          ]),
        );
    });
  });
});
