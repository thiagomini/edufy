import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { parseUUIDWithMessage } from '@src/libs/validation/parse-uuid-with-message.pipe';
import { UserEntity } from '../../user/domain/user.entity';
import { CurrentUser } from '../../user/presentation/current-user.decorator';
import { CourseEntity } from '../domain/course.entity';
import {
  CourseRepository,
  ICourseRepository,
} from '../domain/course.repository';
import { CreateCourseDto } from './create-course.dto';
import { PurchaseService } from '../../payment/application/purchase.service';
import { CourseReadDto } from './course.read-dto';

@Controller('courses')
export class CourseController {
  constructor(
    @Inject(CourseRepository)
    private readonly courseRepository: ICourseRepository,
    private readonly purchaseService: PurchaseService,
  ) {}

  @Post('/')
  async createCourse(
    @Body() createCourseDto: CreateCourseDto,
    @CurrentUser() user: UserEntity,
  ) {
    if (user.role !== 'instructor') {
      throw new ForbiddenException(
        'You do not have permission to create a course',
      );
    }
    const newCourse = CourseEntity.create({
      description: createCourseDto.description,
      title: createCourseDto.title,
      price: createCourseDto.price,
      instructorId: user.id,
    });
    await this.courseRepository.save(newCourse);

    return new CourseReadDto(newCourse);
  }

  @Get(':id')
  async getCourseById(
    @Param('id', parseUUIDWithMessage('Invalid course ID format'))
    id: string,
  ) {
    const course = await this.courseRepository.findOneById(id);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return new CourseReadDto(course);
  }

  @Get('/')
  async getAllCourses() {
    const courses = await this.courseRepository.findAll();
    return courses.map((course) => new CourseReadDto(course));
  }

  @HttpCode(200)
  @Post(':id/checkout')
  async checkoutCourse(
    @Param('id', parseUUIDWithMessage('Invalid course ID format'))
    courseId: string,
    @CurrentUser() user: UserEntity,
  ) {
    if (user.role !== 'student') {
      throw new ForbiddenException('Only students can purchase courses');
    }
    const course = await this.courseRepository.findOneById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return await this.purchaseService.processPurchase({
      course,
      user,
    });
  }
}
