import { Injectable } from '@nestjs/common';
import { User } from '@src/libs/database/generated/db';
import { KyselyRepository } from '@src/libs/database/kysely.repository';
import { Selectable } from 'kysely';
import { UserEntity } from '../domain/user.entity';
import { IUserRepository } from '../domain/user.repository';
import { UserRoleEnum } from '../domain/user.role';

@Injectable()
export class KyselyUserRepository
  extends KyselyRepository
  implements IUserRepository
{
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
        biography: user.biography,
        interests: JSON.stringify(user.interests ?? []),
        profilePictureUrl: user.profilePictureUrl,
      })
      .onConflict((oc) =>
        oc.column('id').doUpdateSet({
          name: user.name,
          password: user.password,
          role: user.role,
          biography: user.biography,
          interests: JSON.stringify(user.interests ?? []),
          profilePictureUrl: user.profilePictureUrl,
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
      biography: userInDb.biography,
      interests: userInDb.interests as string[],
      profilePictureUrl: userInDb.profilePictureUrl,
    });
  }
}
