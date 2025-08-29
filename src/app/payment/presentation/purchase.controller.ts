import {
  Controller,
  ForbiddenException,
  Get,
  Inject,
  NotFoundException,
  Param,
} from '@nestjs/common';
import {
  PurchaseHistoryQuery,
  IPurchaseHistoryQuery,
} from '@src/app/course/domain/purchase-history.query';
import { UserEntity } from '@src/app/user/domain/user.entity';
import { CurrentUser } from '@src/app/user/presentation/current-user.decorator';
import { parseUUIDWithMessage } from '@src/libs/validation/parse-uuid-with-message.pipe';
import { UUID } from 'crypto';

@Controller('payments/purchases')
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
    if (user.role === 'instructor') {
      throw new ForbiddenException('Instructors cannot access purchases');
    }
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
