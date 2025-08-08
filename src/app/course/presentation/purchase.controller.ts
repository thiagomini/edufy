import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { parseUUIDWithMessage } from '@src/libs/validation/parse-uuid-with-message.pipe';
import { UUID } from 'node:crypto';
import {
  IPurchaseHistoryQuery,
  PurchaseHistoryQuery,
} from '../domain/purchase-history.query';
import { CurrentUser } from '@src/app/user/presentation/current-user.decorator';
import { UserEntity } from '@src/app/user/domain/user.entity';

@Controller('purchases')
export class PurchaseController {
  constructor(
    @Inject(PurchaseHistoryQuery)
    private readonly purchaseHistoryQuery: IPurchaseHistoryQuery,
  ) {}

  @Get(':id')
  async getPurchaseById(
    @Param('id', parseUUIDWithMessage('Invalid purchase ID format')) id: UUID,
    @CurrentUser() user: UserEntity,
  ) {
    const purchase = await this.purchaseHistoryQuery.findByUserPurchase({
      userId: user.id,
      purchaseId: id,
    });
    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }
    return purchase;
  }
}
