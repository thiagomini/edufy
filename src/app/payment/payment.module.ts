import { Module } from '@nestjs/common';
import { PaymentsWebhook } from './presentation/payments.webhook';
import { PurchaseRepository } from '../course/domain/purchase.repository';
import { KyselyPurchaseRepository } from '../course/infrastructure/kysely.purchase-repository';
import { CourseModule } from '../course/course.module';
import { PurchaseConfirmedEventHandler } from './application/purchase-confirmed.event-handler';

@Module({
  imports: [CourseModule],
  providers: [
    {
      provide: PurchaseRepository,
      useClass: KyselyPurchaseRepository,
    },
    PurchaseConfirmedEventHandler,
  ],
  controllers: [PaymentsWebhook],
})
export class PaymentModule {}
