import { Database } from '@src/libs/database/database.type';
import { PurchaseEntity } from '../domain/purchase.entity';
import { IPurchaseRepository } from '../domain/purchase.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE } from '@src/libs/database/constants';

@Injectable()
export class KyselyPurchaseRepository implements IPurchaseRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async save(purchase: PurchaseEntity): Promise<void> {
    await this.db
      .insertInto('purchase')
      .values({
        id: purchase.id,
        courseId: purchase.courseId,
        userId: purchase.userId,
        status: purchase.status,
        price: purchase.price,
        createdAt: purchase.purchaseDate,
      })
      .onConflict((oc) =>
        oc.column('id').doUpdateSet({
          courseId: purchase.courseId,
          userId: purchase.userId,
          status: purchase.status,
          price: purchase.price,
          updatedAt: new Date(),
        }),
      )
      .execute();
  }
}
