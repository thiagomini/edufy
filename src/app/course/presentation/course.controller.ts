import {
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
import { PurchaseService } from '../../payment/application/purchase.service';
import { UserEntity } from '../../user/domain/user.entity';
import { CurrentUser } from '../../user/presentation/current-user.decorator';
import {
  CourseRepository,
  ICourseRepository,
} from '../domain/course.repository';
import { CourseReadDto } from './course.read-dto';

@Controller('courses')
export class CourseController {
  constructor(
    @Inject(CourseRepository)
    private readonly courseRepository: ICourseRepository,
    private readonly purchaseService: PurchaseService,
  ) {}

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
