import { randomUUID } from 'crypto';
import { UserRoleEnum } from './user.role';

export class UserEntity {
  constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly password: string,
    public role: UserRoleEnum | null = null,
    public readonly id: string = randomUUID(),
  ) {}
}
