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
  biography?: string;
  interests?: string[];
  profilePictureUrl?: string;
}

export class UserEntity {
  private constructor(
    public readonly id: string,
    public name: string,
    public readonly email: string,
    public readonly password: string,
    public role: UserRoleEnum | null = null,
    public biography?: string,
    public interests?: string[],
    public profilePictureUrl?: string,
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
      props.biography,
      props.interests,
      props.profilePictureUrl,
    );
  }
}
