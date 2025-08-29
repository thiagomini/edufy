import { Module } from '@nestjs/common';
import { QueueModule } from '@src/libs/queue/queue.module';
import { EnrollStudentProcessor } from './application/enroll-student.processor';
import { CourseRepository } from './domain/course.repository';
import { EnrollmentRepository } from './domain/enrollment.repository';
import { KyselyCourseRepository } from './infrastructure/kysely.course-repository';
import { KyselyEnrollmentRepository } from './infrastructure/kysely.enrollment.repository';
import { CourseController } from './presentation/course.controller';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [QueueModule.registerQueue('enroll-student'), PaymentModule],
  controllers: [CourseController],
  providers: [
    {
      provide: CourseRepository,
      useClass: KyselyCourseRepository,
    },
    {
      provide: EnrollmentRepository,
      useClass: KyselyEnrollmentRepository,
    },
    EnrollStudentProcessor,
  ],
  exports: [CourseRepository, EnrollmentRepository],
})
export class CourseModule {}
