import {
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { Webhook } from '@src/libs/webhook/webhook.decorator';
import { PurchaseConfirmedEvent } from '../domain/purchase-confirmed.event';
import { UserEventDto } from './dto/user-event.dto';
import { PurchaseService } from '@src/app/course/application/purchase.service';

@Webhook('/users/webhook')
export class UserWebhook {
  constructor(private readonly purchaseService: PurchaseService) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('')
  async handleUserWebhook(@Body() event: UserEventDto) {
    if (event.type === 'purchase.confirmed') {
      const purchaseConfirmedEvent = new PurchaseConfirmedEvent(event);
      const purchaseConfirmed = await this.purchaseService.confirmPurchase(
        purchaseConfirmedEvent.data.id,
      );
      if (!purchaseConfirmed) {
        throw new NotFoundException('Purchase not found');
      }
    }
  }
}
