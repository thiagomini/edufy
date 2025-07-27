import { UserEntity } from './user.entity';

export interface IUserRepository {
  findOneByEmail(email: string): Promise<UserEntity | null>;
  save(user: UserEntity): Promise<void>;
}

export const UserRepository = Symbol.for('user:IUserRepository');
