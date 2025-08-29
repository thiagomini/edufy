import {
  Controller,
  ForbiddenException,
  Get,
  Inject,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { PurchaseService } from '@src/app/course/application/purchase.service';
import {
  PurchaseHistoryQuery,
  IPurchaseHistoryQuery,
} from '@src/app/course/domain/purchase-history.query';
import { UserEntity } from '@src/app/user/domain/user.entity';
import { CurrentUser } from '@src/app/user/presentation/current-user.decorator';
import { parseUUIDWithMessage } from '@src/libs/validation/parse-uuid-with-message.pipe';
import { UUID } from 'crypto';

@Controller('payments')
export class PurchaseController {
  constructor(
    @Inject(PurchaseHistoryQuery)
    private readonly purchaseHistoryQuery: IPurchaseHistoryQuery,
    private readonly purchaseService: PurchaseService,
  ) {}

  @Get('purchases/:id')
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

  @Get('purchase-history')
  async getPurchaseHistory(@CurrentUser() user: UserEntity) {
    if (user.role !== 'student') {
      throw new ForbiddenException('Only students can access purchase history');
    }
    return await this.purchaseService.getPurchaseHistory(user);
  }
}
