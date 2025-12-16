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
import { CourseEntity } from '@src/app/course/domain/course.entity';
import {
  CourseRepository,
  ICourseRepository,
} from '@src/app/course/domain/course.repository';
import { CourseReadDto } from '@src/app/course/presentation/course.read-dto';
import { CreateCourseDto } from '@src/app/course/presentation/create-course.dto';
import { UserEntity } from '@src/app/user/domain/user.entity';
import { CurrentUser } from '@src/app/user/presentation/current-user.decorator';
import { parseUUIDWithMessage } from '@src/libs/validation/parse-uuid-with-message.pipe';

@Controller('learning/courses')
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
}
