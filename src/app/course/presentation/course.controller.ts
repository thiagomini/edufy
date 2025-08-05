import {
  Body,
  Controller,
  ForbiddenException,
  Get,
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

@Controller('courses')
export class CourseController {
  constructor(
    @Inject(CourseRepository)
    private readonly courseRepository: ICourseRepository,
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

    return {
      id: newCourse.id,
      title: newCourse.title,
      description: newCourse.description,
      price: newCourse.price,
      instructor: user.id,
    };
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
    return course;
  }
}
