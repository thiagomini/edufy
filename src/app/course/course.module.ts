import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { CourseRepository } from './course.repository';
import { KyselyCourseRepository } from './kysely.course-repository';

@Module({
  controllers: [CourseController],
  providers: [
    {
      provide: CourseRepository,
      useClass: KyselyCourseRepository,
    },
  ],
  exports: [CourseRepository],
})
export class CourseModule {}
