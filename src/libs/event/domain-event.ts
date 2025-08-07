export interface DomainEvent<Type extends string, TData = any> {
  readonly type: Type;
  readonly data: TData;
  readonly timestamp: string; // ISO 8601 format
}
