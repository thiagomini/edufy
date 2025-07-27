import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupUserDto } from './signup-user.dto';
import { LoginDto } from './login.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('users')
export class UserController {
  constructor(private readonly jwtService: JwtService) {}

  private readonly users = new Map<string, SignupUserDto>();

  @Post('/')
  async createUser(@Body() signupUserDto: SignupUserDto) {
    const userExists = this.users.has(signupUserDto.email);
    if (userExists) {
      throw new ConflictException('Email already in use');
    }
    this.users.set(signupUserDto.email, signupUserDto);
    return {
      jwtAccessToken: this.signJwtToken(signupUserDto.email),
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('/login')
  async login(@Body() credentials: LoginDto) {
    const user = this.users.get(credentials.email);
    const passMatch = user?.password === credentials.password;
    if (!user || !passMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return {
      jwtAccessToken: this.signJwtToken(user.email),
    };
  }

  private signJwtToken(email: string): string {
    return this.jwtService.sign({ sub: email });
  }
}
