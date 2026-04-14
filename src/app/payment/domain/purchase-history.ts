import { UUID } from 'node:crypto';
import { PurchaseStatusEnum } from './purchase.entity';

export interface PurchaseHistory {
  id: UUID;
  userId: UUID;
  course: {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
  };
  purchaseDate: Date;
  confirmedAt: Date;
  status: PurchaseStatusEnum;
}
