import { Module } from '@nestjs/common';
import { CourseController } from './presentation/course.controller';
import { CourseRepository } from './domain/course.repository';
import { KyselyCourseRepository } from './infrastructure/kysely.course-repository';

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
