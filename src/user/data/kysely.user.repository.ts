import { Inject, Injectable } from '@nestjs/common';
import { UserEntity } from '../domain/user.entity';
import { IUserRepository } from '../domain/user.repository';
import { Database } from '@src/database/database.type';
import { DATABASE } from '@src/database/constants';
import { UserRoleEnum } from '../domain/user.role';
import { Selectable } from 'kysely';
import { User } from '@src/database/generated/db';

@Injectable()
export class KyselyUserRepository implements IUserRepository {
  constructor(
    @Inject(DATABASE)
    private readonly database: Database,
  ) {}

  async findOneByEmail(email: string): Promise<UserEntity | null> {
    return await this.database
      .selectFrom('user')
      .selectAll()
      .where('email', '=', email)
      .$narrowType<{
        role: UserRoleEnum;
      }>()
      .executeTakeFirst()
      .then((userInDb) => this.mapToUserEntity(userInDb));
  }
  async findOneById(id: string): Promise<UserEntity | null> {
    return await this.database
      .selectFrom('user')
      .selectAll()
      .where('id', '=', id)
      .$narrowType<{
        role: UserRoleEnum;
      }>()
      .executeTakeFirst()
      .then((userInDb) => this.mapToUserEntity(userInDb));
  }
  async save(user: UserEntity): Promise<void> {
    await this.database
      .insertInto('user')
      .values({
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
      })
      .onConflict((oc) =>
        oc.column('id').doUpdateSet({
          name: user.name,
          password: user.password,
          role: user.role,
          updatedAt: new Date(),
        }),
      )
      .execute();
  }

  private mapToUserEntity(userInDb?: Selectable<User>) {
    if (!userInDb) {
      return null;
    }
    return UserEntity.fromProps({
      id: userInDb.id,
      name: userInDb.name,
      email: userInDb.email,
      password: userInDb.password,
      role: userInDb.role as UserRoleEnum,
    });
  }
}
