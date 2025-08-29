import { Module } from '@nestjs/common';
import { QueueModule } from '@src/libs/queue/queue.module';
import { EnrollStudentProcessor } from './application/enroll-student.processor';
import { ExamplePaymentGateway } from './application/example-payment.gateway';
import { PaymentGateway } from './application/payment.gateway';
import { PurchaseService } from './application/purchase.service';
import { CourseRepository } from './domain/course.repository';
import { EnrollmentRepository } from './domain/enrollment.repository';
import { PurchaseHistoryQuery } from './domain/purchase-history.query';
import { PurchaseRepository } from './domain/purchase.repository';
import { KyselyCourseRepository } from './infrastructure/kysely.course-repository';
import { KyselyEnrollmentRepository } from './infrastructure/kysely.enrollment.repository';
import { KyselyPurchaseHistoryQuery } from './infrastructure/kysely.purchase-history-query';
import { KyselyPurchaseRepository } from './infrastructure/kysely.purchase-repository';
import { CourseController } from './presentation/course.controller';

@Module({
  imports: [QueueModule.registerQueue('enroll-student')],
  controllers: [CourseController],
  providers: [
    {
      provide: CourseRepository,
      useClass: KyselyCourseRepository,
    },
    {
      provide: PurchaseRepository,
      useClass: KyselyPurchaseRepository,
    },
    {
      provide: PurchaseHistoryQuery,
      useClass: KyselyPurchaseHistoryQuery,
    },
    {
      provide: PaymentGateway,
      useClass: ExamplePaymentGateway,
    },
    {
      provide: EnrollmentRepository,
      useClass: KyselyEnrollmentRepository,
    },
    PurchaseService,
    EnrollStudentProcessor,
  ],
  exports: [
    CourseRepository,
    PurchaseService,
    PurchaseRepository,
    EnrollmentRepository,
  ],
})
export class CourseModule {}
