import { faker } from '@faker-js/faker';
import { PurchaseConfirmedEvent } from '@src/app/user/domain/purchase-confirmed.event';
import { UserRoleEnum } from '@src/app/user/domain/user.role';
import { SignupUserDto } from '@src/app/user/presentation/dto/signup-user.dto';
import { Jwt } from '@src/libs/jwt/jwt';
import { AbstractDSL } from './abstract.dsl';
import { UUID } from 'node:crypto';

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
  ): Promise<Jwt<{ sub: UUID }>> {
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
    role: Exclude<UserRoleEnum, 'support_agent'>,
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

  getPurchaseHistory() {
    return this.req().get('/users/me/purchase-history').set(this.headers);
  }

  confirmPurchase(purchaseConfirmedEvent: PurchaseConfirmedEvent) {
    return this.req()
      .post(`/users/webhook`)
      .set(this.headers)
      .send(purchaseConfirmedEvent);
  }

  getEnrollments() {
    return this.req().get('/users/me/enrollments').set(this.headers);
  }
}
