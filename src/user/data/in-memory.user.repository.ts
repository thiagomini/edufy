import { Injectable } from '@nestjs/common';
import { UserEntity } from '../domain/user.entity';
import { IUserRepository } from '../domain/user.repository';

@Injectable()
export class InMemoryUserRepository implements IUserRepository {
  private readonly users = new Map<string, UserEntity>();

  async findOneByEmail(email: string): Promise<UserEntity | null> {
    return this.users.get(email) ?? null;
  }

  async findOneById(id: string): Promise<UserEntity | null> {
    const allUsers = Array.from(this.users.values());
    return allUsers.find((user) => user.id === id) ?? null;
  }

  async save(user: UserEntity): Promise<void> {
    this.users.set(user.email, user);
  }
}
