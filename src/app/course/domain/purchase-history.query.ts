import { UUID } from 'node:crypto';
import { PurchaseHistory } from './purchase-history';

export interface IPurchaseHistoryQuery {
  findAllByUserId(userId: UUID): Promise<PurchaseHistory[]>;
  findByPurchaseId(purchaseId: UUID): Promise<PurchaseHistory | null>;
}

export const PurchaseHistoryQuery = Symbol.for('PurchaseHistoryQuery');
