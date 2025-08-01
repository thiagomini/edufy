export const TicketStatus = {
  Open: 'open',
  Closed: 'closed',
} as const;

export type TicketStatusEnum = (typeof TicketStatus)[keyof typeof TicketStatus];
