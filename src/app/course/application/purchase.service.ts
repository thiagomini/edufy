import { Inject, Injectable } from '@nestjs/common';
import { UserEntity } from '@src/app/user/domain/user.entity';
import { CourseEntity } from '../domain/course.entity';
import { PurchaseEntity } from '../domain/purchase.entity';
import {
  IPurchaseRepository,
  PurchaseRepository,
} from '../domain/purchase.repository';
import {
  IPurchaseHistoryQuery,
  PurchaseHistoryQuery,
} from '../domain/purchase-history.query';
import { UUID } from 'node:crypto';

export interface PurchaseInput {
  course: CourseEntity;
  user: UserEntity;
}

@Injectable()
export class PurchaseService {
  constructor(
    @Inject(PurchaseRepository)
    private readonly purchaseRepository: IPurchaseRepository,
    @Inject(PurchaseHistoryQuery)
    private readonly purchaseHistoryQuery: IPurchaseHistoryQuery,
  ) {}

  async processPurchase({ course, user }: PurchaseInput) {
    const newPurchase = PurchaseEntity.create({
      courseId: course.id,
      userId: user.id,
      price: course.price,
      currency: 'BRL',
    });

    await this.purchaseRepository.save(newPurchase);

    return {
      checkoutUrl: `https://checkout.example.com/${newPurchase.id}`,
      id: newPurchase.id,
    };
  }

  async getPurchaseHistory(user: UserEntity) {
    const purchases = await this.purchaseHistoryQuery.findAllByUserId(
      user.id as UUID,
    );
    return purchases;
  }

  async confirmPurchase(purchaseId: UUID) {
    const purchaseById = await this.purchaseRepository.findById(purchaseId);
    if (purchaseById) {
      purchaseById.status = 'completed';
      await this.purchaseRepository.save(purchaseById);
    }
    return purchaseById;
  }
}
