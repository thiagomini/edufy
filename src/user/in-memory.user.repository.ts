import { Injectable } from '@nestjs/common';
import { UserEntity } from './user.entity';
import { IUserRepository } from './user.repository';

@Injectable()
export class InMemoryUserRepository implements IUserRepository {
  private readonly users = new Map<string, UserEntity>();

  async findOneByEmail(email: string): Promise<UserEntity | null> {
    return this.users.get(email) ?? null;
  }

  async save(user: UserEntity): Promise<void> {
    this.users.set(user.email, user);
  }
}
