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
    PurchaseService,
  ],
  exports: [CourseRepository, PurchaseService, PurchaseRepository],
})
export class CourseModule {}
