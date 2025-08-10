import { UUID } from 'node:crypto';
import { PurchaseEntity, PurchaseProps } from './purchase.entity';

export interface IPurchaseRepository {
  save(purchase: PurchaseEntity): Promise<void>;
  findById(id: UUID): Promise<PurchaseEntity | null>;
  findAllBy(partial: Partial<PurchaseProps>): Promise<PurchaseEntity[]>;
}

export const PurchaseRepository = Symbol.for('course:IPurchaseRepository');
