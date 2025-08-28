import { Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  IPurchaseRepository,
  PurchaseRepository,
} from '@src/app/course/domain/purchase.repository';
import { PurchaseConfirmedEvent } from '@src/app/user/domain/purchase-confirmed.event';
import { WebhookEventDto } from '@src/libs/webhook/webhook.event';

export class PurchaseConfirmedEventHandler {
  constructor(
    @Inject(PurchaseRepository)
    private readonly purchaseRepository: IPurchaseRepository,
  ) {}

  @OnEvent('purchase.confirmed')
  async handlePurchaseConfirmedEvent(event: WebhookEventDto) {
    const purchaseConfirmedEvent = new PurchaseConfirmedEvent(event);
    const purchase = await this.purchaseRepository.findById(
      purchaseConfirmedEvent.data.id,
    );
    if (!purchase) {
      throw new Error('Purchase not found');
    }

    purchase.confirm(event.timestamp);

    await this.purchaseRepository.save(purchase);
  }
}
