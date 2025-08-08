import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { parseUUIDWithMessage } from '@src/libs/validation/parse-uuid-with-message.pipe';
import { UUID } from 'node:crypto';

@Controller('purchases')
export class PurchaseController {
  @Get(':id')
  getPurchaseById(
    @Param('id', parseUUIDWithMessage('Invalid purchase ID format')) id: UUID,
  ) {
    throw new NotFoundException('Purchase not found');
  }
}
