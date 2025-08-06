import { PurchaseEntity } from './purchase.entity';

export interface IPurchaseRepository {
  save(purchase: PurchaseEntity): Promise<void>;
}

export const PurchaseRepository = Symbol.for('course:IPurchaseRepository');
