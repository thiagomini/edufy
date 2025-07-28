import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { SignupUserDto } from './signup-user.dto';
import { LoginDto } from './login.dto';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { IUserRepository, UserRepository } from './user.repository';
import { UserEntity } from './user.entity';
import { JwtGuard } from './jwt.guard';
import { CurrentUser } from './current-user.decorator';

@Controller('users')
export class UserController {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(UserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  @Post('/')
  async createUser(@Body() signupUserDto: SignupUserDto) {
    const userExists = await this.userRepository.findOneByEmail(
      signupUserDto.email,
    );
    if (userExists) {
      throw new ConflictException('Email already in use');
    }
    const newUser = new UserEntity(
      signupUserDto.name,
      signupUserDto.email,
      await argon2.hash(signupUserDto.password),
    );

    await this.userRepository.save(newUser);

    return {
      jwtAccessToken: this.signJwtToken(newUser),
    };
  }

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

  @UseGuards(JwtGuard)
  @Get('/me')
  async me(@CurrentUser() user: UserEntity) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  private signJwtToken(user: UserEntity): string {
    return this.jwtService.sign({ sub: user.id });
  }
}
