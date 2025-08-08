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
import { PurchaseConfirmedEvent } from '../domain/purchase-confirmed.event';
import { UserEventDto } from './dto/user-event.dto';

@Webhook('/users/webhook')
export class UserWebhook {
  constructor(
    @Inject(PurchaseRepository)
    private readonly purchaseRepository: IPurchaseRepository,
  ) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('')
  async handleUserWebhook(@Body() event: UserEventDto) {
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
    }
  }
}
