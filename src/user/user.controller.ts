import { Body, Controller, Post } from '@nestjs/common';
import { SignupUserDto } from './signup-user.dto';

@Controller('users')
export class UserController {
  @Post('/')
  async createUser(@Body() signupUserDto: SignupUserDto) {
    console.log('User created:', signupUserDto);
    return signupUserDto;
  }
}
