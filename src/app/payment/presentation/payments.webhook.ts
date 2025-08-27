import {
  Body,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Post,
} from '@nestjs/common';
import {
  IPurchaseRepository,
  PurchaseRepository,
} from '@src/app/course/domain/purchase.repository';
import { Webhook } from '@src/libs/webhook/webhook.decorator';
import {
  EnrollmentRepository,
  IEnrollmentRepository,
} from '@src/app/course/domain/enrollment.repository';
import { EnrollmentEntity } from '@src/app/course/domain/enrollment.entity';
import { PurchaseConfirmedEvent } from '@src/app/user/domain/purchase-confirmed.event';
import { WebhookEventDto } from '@src/libs/webhook/webhook.event';

@Webhook('/payments/webhook')
export class PaymentsWebhook {
  constructor(
    @Inject(PurchaseRepository)
    private readonly purchaseRepository: IPurchaseRepository,
    @Inject(EnrollmentRepository)
    private readonly enrollmentRepository: IEnrollmentRepository,
  ) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('')
  async handlePaymentsWebhook(@Body() event: WebhookEventDto) {
    if (event.type === 'purchase.confirmed') {
      const purchaseConfirmedEvent = new PurchaseConfirmedEvent(event);
      const purchase = await this.purchaseRepository.findById(
        purchaseConfirmedEvent.data.id,
      );
      if (!purchase) {
        throw new NotFoundException('Purchase not found');
      }
      purchase.status = 'completed';
      purchase.confirmedAt = new Date(purchaseConfirmedEvent.timestamp);

      await this.purchaseRepository.save(purchase);

      const enrollment = EnrollmentEntity.create({
        courseId: purchase.courseId,
        studentId: purchase.userId,
      });
      await this.enrollmentRepository.save(enrollment);
    }
  }
}
