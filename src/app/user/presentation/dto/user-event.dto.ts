import {
  IsDateString,
  IsNotEmpty,
  IsNotEmptyObject,
  IsString,
} from 'class-validator';

export class UserEventDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsNotEmpty()
  @IsNotEmptyObject()
  data: Record<string, any>;

  @IsNotEmpty()
  @IsDateString()
  timestamp: string;
}
