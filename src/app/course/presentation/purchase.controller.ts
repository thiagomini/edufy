import { Controller, Get, Param } from '@nestjs/common';

@Controller('purchases')
export class PurchaseController {
  @Get(':id')
  getPurchaseById(@Param('id') id: string) {}
}
