import { faker } from '@faker-js/faker';
import { SignupUserDto } from '@src/app/user/presentation/dto/signup-user.dto';
import { AbstractDSL } from './abstract.dsl';
import { Jwt } from '@src/libs/jwt/jwt';
import { UserRoleEnum } from '@src/app/user/domain/user.role';

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

  async createUserWithRole(
    role: UserRoleEnum,
    userData: Partial<SignupUserDto> = {},
  ) {
    const jwt = await this.createRandomUser({
      ...userData,
      name: userData.name || faker.person.fullName(),
      email: userData.email || faker.internet.email(),
    });

    await this.authenticatedAs(jwt).selfAssignRole(role).expect(204);

    return jwt;
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

  update(userData: any) {
    return this.req().patch('/users/me').set(this.headers).send(userData);
  }

  tickets() {
    return this.req().get('/users/me/tickets').set(this.headers);
  }
}
