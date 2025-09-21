import { Module } from '@nestjs/common';
import { CourseController } from './presentation/course.controller';
import { CourseRepository } from '../course/domain/course.repository';
import { KyselyCourseRepository } from '../course/infrastructure/kysely.course-repository';

@Module({
  controllers: [CourseController],
  providers: [
    {
      provide: CourseRepository,
      useClass: KyselyCourseRepository,
    },
  ],
})
export class LearningModule {}
