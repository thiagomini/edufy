import { randomUUID } from 'crypto';

export class UserEntity {
  constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly password: string,
    public readonly role:
      | 'support_agent'
      | 'student'
      | 'instructor'
      | null = null,
    public readonly id: string = randomUUID(),
  ) {}
}
