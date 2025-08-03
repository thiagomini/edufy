import { Body, Controller, ForbiddenException, Post } from '@nestjs/common';
import { CreateCourseDto } from './create-course.dto';
import { CurrentUser } from '../user/presentation/current-user.decorator';
import { UserEntity } from '../user/domain/user.entity';

@Controller('courses')
export class CourseController {
  @Post('/')
  createCourse(
    @Body() createCourseDto: CreateCourseDto,
    @CurrentUser() user: UserEntity,
  ) {
    // Logic to create a course will go here
    if (user.role !== 'instructor') {
      throw new ForbiddenException(
        'You do not have permission to create a course',
      );
    }
    return { message: 'Course created successfully' };
  }
}
