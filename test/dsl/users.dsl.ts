import { faker } from '@faker-js/faker';
import { SignupUserDto } from '@src/app/user/presentation/signup-user.dto';
import { AbstractDSL } from './abstract.dsl';
import { Jwt } from '@src/libs/jwt/jwt';

export class UsersDSL extends AbstractDSL {
  createUser(userData: SignupUserDto) {
    return this.req().post('/users').set(this.headers).send(userData);
  }

  /**
   * Creates a random user with default randomly generated values
   * @returns The JWT access token of the created user
   */
  async createRandomUser(
    partial: Partial<SignupUserDto> = {},
  ): Promise<Jwt<{ sub: string }>> {
    const userData: SignupUserDto = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password({ length: 8 }),
      ...partial,
    };
    return this.createUser(userData)
      .expect(201)
      .then((response) => new Jwt(response.body.jwtAccessToken));
  }

  login(credentials: { email: string; password: string }) {
    return this.req().post('/users/login').set(this.headers).send(credentials);
  }

  me() {
    return this.req().get('/users/me').set(this.headers);
  }

  selfAssignRole(role: string) {
    return this.req()
      .post('/users/self-assign-role')
      .set(this.headers)
      .send({ role });
  }
}
