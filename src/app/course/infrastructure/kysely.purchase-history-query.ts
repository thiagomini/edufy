import { UUID } from 'crypto';
import { PurchaseHistory } from '../domain/purchase-history';
import {
  IPurchaseHistoryQuery,
  UserPurchase,
} from '../domain/purchase-history.query';
import { Inject } from '@nestjs/common';
import { DATABASE } from '@src/libs/database/constants';
import { Database } from '@src/libs/database/database.type';
import { jsonObjectFrom } from 'kysely/helpers/postgres';
import { sql } from 'kysely';
import { PurchaseStatusEnum } from '../domain/purchase.entity';
export class KyselyPurchaseHistoryQuery implements IPurchaseHistoryQuery {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

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
      course: {
        id: row.course.id,
        title: row.course.title,
        description: row.course.description,
        price: +row.course.price,
        currency: row.course.currency,
      },
      purchaseDate: row.purchaseDate,
      status: row.status as PurchaseStatusEnum,
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
    return this.db
      .selectFrom('purchase')
      .select(['purchase.id', 'status', 'createdAt as purchaseDate'])
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
      ]);
  }
}
