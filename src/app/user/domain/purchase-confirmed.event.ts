import { DomainEvent } from '@src/libs/event/domain-event';
import z from 'zod/v4';

export class PurchaseConfirmedEvent
  implements DomainEvent<'purchase.confirmed', { id: string }>
{
  type = 'purchase.confirmed' as const;
  data: { id: string };
  timestamp: string;

  constructor(props: { data: Record<string, any>; timestamp: string }) {
    const parsed = buildPurchaseConfirmedSchema.parse(props);

    this.data = { id: parsed.data.id };
    this.timestamp = parsed.timestamp;
  }
}

const buildPurchaseConfirmedSchema = z.object({
  data: z.object({
    id: z.uuid(),
  }),
  timestamp: z.iso.datetime(),
});
