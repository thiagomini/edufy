import { KyselyRepository } from '@src/libs/database/kysely.repository';
import { UUID } from 'crypto';
import { sql } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/postgres';
import { PurchaseHistory } from '../domain/purchase-history';
import {
  IPurchaseHistoryQuery,
  UserPurchase,
} from '../domain/purchase-history.query';
import { PurchaseStatusEnum } from '../domain/purchase.entity';
export class KyselyPurchaseHistoryQuery
  extends KyselyRepository
  implements IPurchaseHistoryQuery
{
  async findByUserPurchase({
    purchaseId,
    userId,
  }: UserPurchase): Promise<PurchaseHistory | null> {
    const row = await this.selectPurchaseAndCourse()
      .where('purchase.id', '=', purchaseId)
      .where('purchase.userId', '=', userId)
      .orderBy('purchase.createdAt', 'desc')
      .executeTakeFirst();

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      userId: row.userId,
      course: {
        id: row.course.id,
        title: row.course.title,
        description: row.course.description,
        price: +row.course.price,
        currency: row.course.currency,
      },
      purchaseDate: row.purchaseDate,
      confirmedAt: row.confirmedAt,
      status: row.status,
    };
  }

  async findAllByUserId(userId: UUID): Promise<PurchaseHistory[]> {
    const result = await this.selectPurchaseAndCourse()
      .where('purchase.userId', '=', userId)
      .orderBy('purchase.createdAt', 'desc')
      .execute();
    return result.map(
      (row) =>
        ({
          id: row.id,
          course: {
            id: row.course.id,
            title: row.course.title,
            description: row.course.description,
            price: +row.course.price,
            currency: row.course.currency,
          },
          purchaseDate: row.purchaseDate,
          status: row.status,
        }) as PurchaseHistory,
    );
  }

  private selectPurchaseAndCourse() {
    return this.database
      .selectFrom('purchase')
      .select([
        'purchase.id',
        'userId',
        'status',
        'createdAt as purchaseDate',
        'confirmedAt',
      ])
      .select((eb) => [
        jsonObjectFrom(
          eb
            .selectFrom('course')
            .select([
              'course.id',
              'course.title',
              'course.description',
              'course.price',
              sql<string>`'BRL'`.as('currency'),
            ])
            .whereRef('course.id', '=', 'purchase.courseId'),
        ).as('course'),
      ])
      .$narrowType<{
        id: UUID;
        userId: UUID;
        status: PurchaseStatusEnum;
      }>();
  }
}
