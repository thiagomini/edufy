export interface WebhookEvent<Type extends string, TData = any> {
  type: Type;
  data: TData;
  timestamp?: string; // ISO 8601 format
}
