import { UUID } from 'node:crypto';
import { PurchaseHistory } from './purchase-history';

export interface UserPurchase {
  userId: UUID;
  purchaseId: UUID;
}

export interface IPurchaseHistoryQuery {
  findAllByUserId(userId: UUID): Promise<PurchaseHistory[]>;
  findByUserPurchase({
    userId,
    purchaseId,
  }: UserPurchase): Promise<PurchaseHistory | null>;
}

export const PurchaseHistoryQuery = Symbol.for('PurchaseHistoryQuery');
