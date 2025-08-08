import { Body, NotFoundException, Post } from '@nestjs/common';
import { Webhook } from '@src/libs/webhook/webhook.decorator';
import { PurchaseConfirmedEvent } from '../domain/purchase-confirmed.event';
import { UserEventDto } from './dto/user-event.dto';

@Webhook('/users/webhook')
export class UserWebhook {
  @Post('')
  handleUserWebhook(@Body() event: UserEventDto) {
    if (event.type === 'purchase.confirmed') {
      const _purchaseConfirmedEvent = new PurchaseConfirmedEvent(event);
      throw new NotFoundException('Purchase not found');
    }
  }
}
