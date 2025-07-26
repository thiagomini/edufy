import { SignupUserDto } from 'src/user/signup-user.dto';
import { AbstractDSL } from './abstract.dsl';

export class UsersDSL extends AbstractDSL {
  createUser(userData: SignupUserDto) {
    return this.req().post('/users').send(userData);
  }

  login(credentials: { email: string; password: string }) {
    return this.req().post('/users/login').send(credentials);
  }
}
