import { Module } from '@nestjs/common';
import { PurchaseRepository } from '../course/domain/purchase.repository';
import { KyselyPurchaseRepository } from '../course/infrastructure/kysely.purchase-repository';
import { PurchaseConfirmedEventHandler } from './application/purchase-confirmed.event-handler';
import { PaymentsWebhook } from './presentation/payments.webhook';
import { QueueModule } from '@src/libs/queue/queue.module';
import { PurchaseController } from './presentation/purchase.controller';
import { PurchaseHistoryQuery } from '../course/domain/purchase-history.query';
import { KyselyPurchaseHistoryQuery } from '../course/infrastructure/kysely.purchase-history-query';

@Module({
  imports: [QueueModule.registerQueue('enroll-student')],
  providers: [
    {
      provide: PurchaseRepository,
      useClass: KyselyPurchaseRepository,
    },
    {
      provide: PurchaseHistoryQuery,
      useClass: KyselyPurchaseHistoryQuery,
    },
    PurchaseConfirmedEventHandler,
  ],
  controllers: [PaymentsWebhook, PurchaseController],
})
export class PaymentModule {}
