import { Database } from '@src/libs/database/database.type';
import { PurchaseEntity, PurchaseStatusEnum } from '../domain/purchase.entity';
import { IPurchaseRepository } from '../domain/purchase.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE } from '@src/libs/database/constants';
import { UUID } from 'crypto';
import { Selectable } from 'kysely';
import { Purchase } from '@src/libs/database/generated/db';

@Injectable()
export class KyselyPurchaseRepository implements IPurchaseRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async findById(id: UUID): Promise<PurchaseEntity | null> {
    return await this.db
      .selectFrom('purchase')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst()
      .then((res) => this.mapToPurchaseEntity(res));
  }

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
          confirmedAt: purchase.confirmedAt,
          updatedAt: new Date(),
        }),
      )
      .execute();
  }

  private mapToPurchaseEntity(
    row: Selectable<Purchase>,
  ): PurchaseEntity | null {
    if (!row) return null;

    return PurchaseEntity.fromProps({
      id: row.id as UUID,
      courseId: row.courseId as UUID,
      userId: row.userId as UUID,
      status: row.status as PurchaseStatusEnum,
      price: +row.price,
      purchaseDate: row.createdAt,
      currency: 'BRL',
      confirmedAt: row.confirmedAt,
    });
  }
}
