import { PurchaseConfirmedEvent } from '@src/app/user/domain/purchase-confirmed.event';
import { AbstractDSL } from './abstract.dsl';
import { UUID } from 'node:crypto';

export class PaymentsDSL extends AbstractDSL {
  confirmPurchase(purchaseConfirmedEvent: PurchaseConfirmedEvent) {
    return this.req()
      .post(`/payments/webhook`)
      .set(this.headers)
      .send(purchaseConfirmedEvent);
  }

  getPurchaseById(purchaseId: UUID) {
    return this.req()
      .get(`/payments/purchases/${purchaseId}`)
      .set(this.headers);
  }

  getPurchaseHistory() {
    return this.req().get('/payments/purchase-history').set(this.headers);
  }
}
