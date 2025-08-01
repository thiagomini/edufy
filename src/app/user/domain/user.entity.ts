import { randomUUID } from 'crypto';
import { UserRoleEnum } from './user.role';

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role?: UserRoleEnum | null;
  id?: string;
}

export interface UserProps {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRoleEnum | null;
}

export class UserEntity {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly password: string,
    public role: UserRoleEnum | null = null,
  ) {}

  public static create(input: CreateUserInput): UserEntity {
    return new UserEntity(
      input.id ?? randomUUID(),
      input.name,
      input.email,
      input.password,
      input.role ?? null,
    );
  }

  public static fromProps(props: UserProps): UserEntity {
    return new UserEntity(
      props.id,
      props.name,
      props.email,
      props.password,
      props.role,
    );
  }
}
