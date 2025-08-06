import { UUID } from 'node:crypto';
import { PurchaseHistory } from './purchase-history';

export interface IPurchaseHistoryQuery {
  findAllByUserId(userId: UUID): Promise<PurchaseHistory[]>;
}

export const PurchaseHistoryQuery = Symbol.for('PurchaseHistoryQuery');
