import { Module } from '@nestjs/common';
import { CourseController } from './presentation/course.controller';
import { CourseRepository } from './domain/course.repository';
import { KyselyCourseRepository } from './infrastructure/kysely.course-repository';
import { PurchaseRepository } from './domain/purchase.repository';
import { KyselyPurchaseRepository } from './infrastructure/kysely.purchase-repository';
import { PurchaseService } from './application/purchase.service';
import { PurchaseHistoryQuery } from './domain/purchase-history.query';
import { KyselyPurchaseHistoryQuery } from './infrastructure/kysely.purchase-history-query';
import { PurchaseController } from './presentation/purchase.controller';
import { PaymentGateway } from './application/payment.gateway';
import { ExamplePaymentGateway } from './application/example-payment.gateway';
import { EnrollmentRepository } from './domain/enrollment.repository';
import { InMemoryEnrollmentRepository } from './infrastructure/in-memory.enrollment.repository';

@Module({
  controllers: [CourseController, PurchaseController],
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
      useClass: InMemoryEnrollmentRepository,
    },
    PurchaseService,
  ],
  exports: [
    CourseRepository,
    PurchaseService,
    PurchaseRepository,
    EnrollmentRepository,
  ],
})
export class CourseModule {}
