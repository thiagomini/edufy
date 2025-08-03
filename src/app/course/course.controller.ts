import { Controller, Post } from '@nestjs/common';

@Controller('courses')
export class CourseController {
  @Post('/')
  createCourse() {
    // Logic to create a course will go here
    return { message: 'Course created successfully' };
  }
}
