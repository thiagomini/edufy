import {
  Body,
  Controller,
  ForbiddenException,
  Inject,
  Post,
} from '@nestjs/common';
import { UserEntity } from '../user/domain/user.entity';
import { CurrentUser } from '../user/presentation/current-user.decorator';
import { CourseEntity } from './course.entity';
import { CreateCourseDto } from './create-course.dto';
import { CourseRepository, ICourseRepository } from './course.repository';

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
    // Logic to create a course will go here
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
}
