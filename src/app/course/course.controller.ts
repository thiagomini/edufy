import { Body, Controller, Post } from '@nestjs/common';
import { CreateCourseDto } from './create-course.dto';

@Controller('courses')
export class CourseController {
  @Post('/')
  createCourse(@Body() createCourseDto: CreateCourseDto) {
    // Logic to create a course will go here
    return { message: 'Course created successfully' };
  }
}
