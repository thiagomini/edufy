import { KyselyRepository } from '@src/libs/database/kysely.repository';
import { IClientRepository } from '../domain/client.repository';
import { ClientEntity } from '../domain/client.entity';

export class KyselyClientRepository
  extends KyselyRepository
  implements IClientRepository
{
  async findOneById(id: string): Promise<ClientEntity | null> {
    const clientInDb = await this.database
      .selectFrom('user')
      .select(['id', 'email', 'name'])
      .where('id', '=', id)
      .executeTakeFirst();

    if (!clientInDb) return null;

    return ClientEntity.fromProps(clientInDb);
  }
}
