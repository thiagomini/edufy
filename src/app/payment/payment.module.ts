import { Module } from '@nestjs/common';
import { PurchaseRepository } from './domain/purchase.repository';
import { KyselyPurchaseRepository } from './infrastructure/kysely.purchase-repository';
import { PurchaseConfirmedEventHandler } from './application/purchase-confirmed.event-handler';
import { PaymentsWebhook } from './presentation/payments.webhook';
import { QueueModule } from '@src/libs/queue/queue.module';
import { PurchaseController } from './presentation/purchase.controller';
import { PurchaseHistoryQuery } from './domain/purchase-history.query';
import { KyselyPurchaseHistoryQuery } from './infrastructure/kysely.purchase-history-query';
import { PurchaseService } from './application/purchase.service';
import { ExamplePaymentGateway } from './application/example-payment.gateway';
import { PaymentGateway } from './application/payment.gateway';

@Module({
  imports: [QueueModule.registerQueue('enroll-student')],
  controllers: [PaymentsWebhook, PurchaseController],
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
    PurchaseService,
    {
      provide: PaymentGateway,
      useClass: ExamplePaymentGateway,
    },
  ],
  exports: [PurchaseService, PurchaseRepository],
})
export class PaymentModule {}
