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
import { IPaymentGateway, PaymentGateway } from './payment.gateway';

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
    @Inject(PaymentGateway)
    private readonly paymentGateway: IPaymentGateway,
  ) {}

  async processPurchase({ course, user }: PurchaseInput) {
    const newPurchase = PurchaseEntity.create({
      courseId: course.id,
      userId: user.id,
      price: course.price,
      currency: 'BRL',
    });

    await this.purchaseRepository.save(newPurchase);

    const { checkoutUrl } = await this.paymentGateway.createPaymentIntent({
      amount: course.price,
      currency: 'BRL',
      purchaseId: newPurchase.id,
    });

    return {
      checkoutUrl,
      id: newPurchase.id,
    };
  }

  async getPurchaseHistory(user: UserEntity) {
    const purchases = await this.purchaseHistoryQuery.findAllByUserId(
      user.id as UUID,
    );
    return purchases;
  }
}
