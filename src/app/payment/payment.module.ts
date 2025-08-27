import { Module } from '@nestjs/common';
import { PaymentsWebhook } from './presentation/payments.webhook';
import { PurchaseRepository } from '../course/domain/purchase.repository';
import { KyselyPurchaseRepository } from '../course/infrastructure/kysely.purchase-repository';
import { CourseModule } from '../course/course.module';

@Module({
  imports: [CourseModule],
  providers: [
    {
      provide: PurchaseRepository,
      useClass: KyselyPurchaseRepository,
    },
  ],
  controllers: [PaymentsWebhook],
})
export class PaymentModule {}
