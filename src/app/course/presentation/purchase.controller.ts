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

@Controller('purchases')
export class PurchaseController {
  constructor(
    @Inject(PurchaseHistoryQuery)
    private readonly purchaseHistoryQuery: IPurchaseHistoryQuery,
  ) {}

  @Get(':id')
  async getPurchaseById(
    @Param('id', parseUUIDWithMessage('Invalid purchase ID format')) id: UUID,
  ) {
    const purchase = await this.purchaseHistoryQuery.findByPurchaseId(id);
    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }
    return purchase;
  }
}
