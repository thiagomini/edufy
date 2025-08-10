import {
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UserService } from '../application/user.service';
import { UserEntity } from '../domain/user.entity';
import { IUserRepository, UserRepository } from '../domain/user.repository';
import { CurrentUser } from './current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';
import { SelfAssignRoleDto } from './dto/self-assign-role.dto';
import { SignupUserDto } from './dto/signup-user.dto';
import { Jwt } from '@src/libs/jwt/jwt';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ITicketRepository,
  TicketRepository,
} from '@src/app/ticket/domain/ticket.repository';
import { TicketReadDto } from '@src/app/ticket/presentation/dto/ticket.read-dto';
import { UserReadDto } from './dto/user.read-dto';
import {
  CourseRepository,
  ICourseRepository,
} from '@src/app/course/domain/course.repository';
import { PurchaseService } from '@src/app/course/application/purchase.service';
import {
  EnrollmentRepository,
  IEnrollmentRepository,
} from '@src/app/course/domain/enrollment.repository';

@Controller('users')
export class UserController {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(UserRepository)
    private readonly userRepository: IUserRepository,
    private readonly userService: UserService,
    @Inject(TicketRepository)
    private readonly ticketRepository: ITicketRepository,
    @Inject(CourseRepository)
    private readonly courseRepository: ICourseRepository,
    private readonly purchaseService: PurchaseService,
    @Inject(EnrollmentRepository)
    private readonly enrollmentRepository: IEnrollmentRepository,
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
      jwtAccessToken: this.signJwtToken(newUser).toString(),
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
      jwtAccessToken: this.signJwtToken(user).toString(),
    };
  }

  @Get('/me')
  async me(@CurrentUser() user: UserEntity) {
    return new UserReadDto(user);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/self-assign-role')
  async selfAssignRole(
    @CurrentUser() user: UserEntity,
    @Body()
    selfAssignRoleDto: SelfAssignRoleDto,
  ) {
    if (user.role) {
      throw new ConflictException(
        `User already has a "${user.role}" role assigned`,
      );
    }
    user.role = selfAssignRoleDto.role;
    await this.userRepository.save(user);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('/me')
  async updateUser(
    @CurrentUser() user: UserEntity,
    @Body()
    updateUserDto: UpdateUserDto,
  ) {
    if (updateUserDto.name) {
      user.name = updateUserDto.name;
    }
    if (updateUserDto.biography) {
      user.biography = updateUserDto.biography;
    }
    if (updateUserDto.interests) {
      user.interests = updateUserDto.interests;
    }
    if (updateUserDto.profilePictureUrl) {
      user.profilePictureUrl = updateUserDto.profilePictureUrl;
    }

    await this.userRepository.save(user);
  }

  @Get('/me/tickets')
  async getMyTickets(@CurrentUser() user: UserEntity) {
    const userTickets = await this.ticketRepository.findAllCreatedByUser(
      user.id,
    );
    return userTickets.map((ticket) => new TicketReadDto(ticket));
  }

  @Get('/:id/courses')
  async getLecturedCourses(@Param('id') userId: string) {
    return this.courseRepository.findAllLecturedBy(userId);
  }

  @Get('/me/purchase-history')
  async getPurchaseHistory(@CurrentUser() user: UserEntity) {
    if (user.role !== 'student') {
      throw new ForbiddenException('Only students can access purchase history');
    }
    return await this.purchaseService.getPurchaseHistory(user);
  }

  private signJwtToken(user: UserEntity): Jwt {
    return new Jwt(this.jwtService.sign({ sub: user.id }));
  }

  @Get('/me/enrollments')
  async getEnrollments(@CurrentUser() user: UserEntity) {
    if (user.role !== 'student') {
      throw new ForbiddenException('Only students can access enrollments');
    }
    return this.enrollmentRepository.findAllByStudentId(user.id);
  }
}
