import { PurchaseConfirmedEvent } from '@src/app/user/domain/purchase-confirmed.event';
import { AbstractDSL } from './abstract.dsl';

export class PaymentsDSL extends AbstractDSL {
  confirmPurchase(purchaseConfirmedEvent: PurchaseConfirmedEvent) {
    return this.req()
      .post(`/payments/webhook`)
      .set(this.headers)
      .send(purchaseConfirmedEvent);
  }
}
