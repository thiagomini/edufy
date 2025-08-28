import { Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  IPurchaseRepository,
  PurchaseRepository,
} from '@src/app/course/domain/purchase.repository';
import { PurchaseConfirmedEvent } from '@src/app/user/domain/purchase-confirmed.event';
import { InjectQueue } from '@src/libs/queue/queue.decorators';
import { Queue } from '@src/libs/queue/queue.interface';
import { WebhookEventDto } from '@src/libs/webhook/webhook.event';

export class PurchaseConfirmedEventHandler {
  constructor(
    @Inject(PurchaseRepository)
    private readonly purchaseRepository: IPurchaseRepository,
    @InjectQueue('enroll-student')
    private readonly enrollStudentQueue: Queue,
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
    purchase.status = 'completed';
    purchase.confirmedAt = new Date(purchaseConfirmedEvent.timestamp);

    await this.purchaseRepository.save(purchase);

    await this.enrollStudentQueue.addJob({
      purchaseId: purchase.id,
      studentId: purchase.userId,
      courseId: purchase.courseId,
    });
  }
}
