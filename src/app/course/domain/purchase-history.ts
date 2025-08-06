import { PurchaseStatusEnum } from './purchase.entity';

export interface PurchaseHistory {
  id: string;
  course: {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
  };
  purchaseDate: Date;
  status: PurchaseStatusEnum;
}
