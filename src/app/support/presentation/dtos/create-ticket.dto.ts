import { IsNotEmpty } from 'class-validator';

export class CreateTicketDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;
}
