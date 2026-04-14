import { UUID } from 'crypto';
import { PurchaseEntity, PurchaseProps } from '../domain/purchase.entity';
import { IPurchaseRepository } from '../domain/purchase.repository';
import {
  IPurchaseHistoryQuery,
  UserPurchase,
} from '../domain/purchase-history.query';
import { PurchaseHistory } from '../domain/purchase-history';

export class InMemoryPurchaseRepository
  implements IPurchaseRepository, IPurchaseHistoryQuery
{
  findAllBy(partial: Partial<PurchaseProps>): Promise<PurchaseEntity[]> {
    const purchases = Array.from(this.purchases.values()).filter((purchase) =>
      Object.entries(partial).every(
        ([key, value]) => purchase[key as keyof PurchaseEntity] === value,
      ),
    );
    return Promise.resolve(purchases);
  }

  private readonly purchases: Map<UUID, PurchaseEntity> = new Map();

  async save(purchase: PurchaseEntity): Promise<void> {
    this.purchases.set(purchase.id, purchase);
  }
  async findById(id: UUID): Promise<PurchaseEntity | null> {
    return this.purchases.get(id) || null;
  }
  async findAllByUserId(userId: UUID): Promise<PurchaseHistory[]> {
    const purchases = Array.from(this.purchases.values()).filter(
      (ph) => ph.userId === userId,
    );
    return purchases.map((purchase) => this.buildPurchaseHistory(purchase));
  }
  async findByUserPurchase({
    userId,
    purchaseId,
  }: UserPurchase): Promise<PurchaseHistory | null> {
    const purchases = Array.from(this.purchases.values()).filter(
      (ph) => ph.userId === userId,
    );
    const matchingPurchase = purchases.find(
      (purchase) => purchase.id === purchaseId && purchase.userId === userId,
    );

    return matchingPurchase
      ? this.buildPurchaseHistory(matchingPurchase)
      : null;
  }

  private buildPurchaseHistory(purchase: PurchaseEntity): PurchaseHistory {
    return {
      id: purchase.id,
      userId: purchase.userId,
      course: {
        id: purchase.courseId,
        title: 'Test Course',
        description: 'Test Description',
        price: purchase.price,
        currency: purchase.currency,
      },
      purchaseDate: purchase.purchaseDate,
      confirmedAt: purchase.confirmedAt,
      status: purchase.status,
    };
  }
}
