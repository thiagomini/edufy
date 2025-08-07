import { IsUUID } from 'class-validator';
import { UUID } from 'node:crypto';

export class PurchaseConfirmedEventDto {
  @IsUUID()
  id: UUID;
}
