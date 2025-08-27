import { Module } from '@nestjs/common';
import { PurchaseRepository } from '../course/domain/purchase.repository';
import { KyselyPurchaseRepository } from '../course/infrastructure/kysely.purchase-repository';
import { PurchaseConfirmedEventHandler } from './application/purchase-confirmed.event-handler';
import { PaymentsWebhook } from './presentation/payments.webhook';

@Module({
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
