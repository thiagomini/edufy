import { PickType } from '@nestjs/mapped-types';
import { SignupUserDto } from './signup-user.dto';

export class LoginDto extends PickType(SignupUserDto, [
  'email',
  'password',
] as const) {}
