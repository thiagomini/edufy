import { UUID } from 'node:crypto';
import { PurchaseEntity } from './purchase.entity';

export interface IPurchaseRepository {
  save(purchase: PurchaseEntity): Promise<void>;
  findById(id: UUID): Promise<PurchaseEntity | null>;
}

export const PurchaseRepository = Symbol.for('course:IPurchaseRepository');
