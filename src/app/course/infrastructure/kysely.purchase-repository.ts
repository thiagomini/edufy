import { Injectable } from '@nestjs/common';
import { Purchase } from '@src/libs/database/generated/db';
import { KyselyRepository } from '@src/libs/database/kysely.repository';
import { UUID } from 'crypto';
import { Selectable } from 'kysely';
import {
  PurchaseEntity,
  PurchaseProps,
  PurchaseStatusEnum,
} from '../domain/purchase.entity';
import { IPurchaseRepository } from '../domain/purchase.repository';

@Injectable()
export class KyselyPurchaseRepository
  extends KyselyRepository
  implements IPurchaseRepository
{
  async findAllBy(partial: Partial<PurchaseProps>): Promise<PurchaseEntity[]> {
    return await this.database
      .selectFrom('purchase')
      .selectAll()
      .where((qb) =>
        qb.and(partial as unknown as Partial<Selectable<Purchase>>),
      )
      .execute()
      .then((rows) => rows.map((row) => this.mapToPurchaseEntity(row)));
  }

  async findById(id: UUID): Promise<PurchaseEntity | null> {
    return await this.database
      .selectFrom('purchase')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst()
      .then((res) => this.mapToPurchaseEntity(res));
  }

  async save(purchase: PurchaseEntity): Promise<void> {
    await this.database
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
