export class UserEventDto {
  type: string;
  data: Record<string, any>;
  timestamp?: string;
}
