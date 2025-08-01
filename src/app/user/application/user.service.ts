import * as argon2 from 'argon2';

import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { UserEntity } from '../domain/user.entity';
import { UserRepository, IUserRepository } from '../domain/user.repository';

export type CreateUserCommand = {
  name: string;
  email: string;
  password: string;
  role?: 'support_agent' | 'student' | 'instructor';
};

@Injectable()
export class UserService {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async createUser(command: CreateUserCommand) {
    const userExists = await this.userRepository.findOneByEmail(command.email);
    if (userExists) {
      throw new ConflictException('Email already in use');
    }
    const newUser = UserEntity.create({
      name: command.name,
      email: command.email,
      password: await argon2.hash(command.password),
      role: command.role,
    });

    await this.userRepository.save(newUser);
    return newUser;
  }
}
