import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  biography?: string;

  @IsOptional()
  @IsString({ each: true })
  interests?: string[];

  @IsOptional()
  @IsUrl()
  profilePictureUrl?: string;
}
