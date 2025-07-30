import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UserService } from '../application/user.service';
import { UserEntity } from '../domain/user.entity';
import { IUserRepository, UserRepository } from '../domain/user.repository';
import { CurrentUser } from './current-user.decorator';
import { LoginDto } from './login.dto';
import { Public } from './public.decorator';
import { SignupUserDto } from './signup-user.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(UserRepository)
    private readonly userRepository: IUserRepository,
    private readonly userService: UserService,
  ) {}

  @Public()
  @Post('/')
  async createUser(@Body() signupUserDto: SignupUserDto) {
    const newUser = await this.userService.createUser({
      name: signupUserDto.name,
      email: signupUserDto.email,
      password: signupUserDto.password,
    });

    return {
      jwtAccessToken: this.signJwtToken(newUser),
    };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/login')
  async login(@Body() credentials: LoginDto) {
    const user = await this.userRepository.findOneByEmail(credentials.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const passMatch = await argon2.verify(user.password, credentials.password);
    if (!passMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return {
      jwtAccessToken: this.signJwtToken(user),
    };
  }

  @Get('/me')
  async me(@CurrentUser() user: UserEntity) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  @Post('/self-assign-role')
  async selfAssignRole(
    @CurrentUser() user: UserEntity,
    @Body('role') role: 'student' | 'instructor',
  ) {
    return;
  }

  private signJwtToken(user: UserEntity): string {
    return this.jwtService.sign({ sub: user.id });
  }
}
