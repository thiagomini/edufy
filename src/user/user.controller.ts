import { Body, ConflictException, Controller, Post } from '@nestjs/common';
import { SignupUserDto } from './signup-user.dto';

@Controller('users')
export class UserController {
  private readonly users = new Map<string, SignupUserDto>();

  @Post('/')
  async createUser(@Body() signupUserDto: SignupUserDto) {
    const userExists = this.users.has(signupUserDto.email);
    if (userExists) {
      throw new ConflictException('Email already in use');
    }
    this.users.set(signupUserDto.email, signupUserDto);
    return {
      jwtAccessToken: 'header.payload.signature',
    };
  }
}
