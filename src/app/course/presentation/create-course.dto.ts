import { IsNotEmpty, IsPositive } from 'class-validator';

export class CreateCourseDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  @IsPositive()
  price: number;
}
