import { IsNotEmpty } from 'class-validator';

export class ReplyTicketDto {
  @IsNotEmpty()
  content: string;
}
