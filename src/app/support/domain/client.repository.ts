import { ClientEntity } from './client.entity';

export interface IClientRepository {
  findOneById(id: string): Promise<ClientEntity | null>;
}

export const ClientRepository = Symbol.for('support:IClientRepository');
