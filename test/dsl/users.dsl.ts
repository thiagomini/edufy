import { SignupUserDto } from '@src/user/presentation/signup-user.dto';
import { AbstractDSL } from './abstract.dsl';

export class UsersDSL extends AbstractDSL {
  createUser(userData: SignupUserDto) {
    return this.req().post('/users').set(this.headers).send(userData);
  }

  login(credentials: { email: string; password: string }) {
    return this.req().post('/users/login').set(this.headers).send(credentials);
  }

  me() {
    return this.req().get('/users/me').set(this.headers);
  }

  selfAssignRole(role: 'student' | 'instructor') {
    return this.req()
      .post('/users/self-assign-role')
      .set(this.headers)
      .send({ role });
  }
}
