import { Inject } from '@nestjs/common';
import { JobWorker } from '@src/libs/queue/job-worker';
import { Processor } from '@src/libs/queue/queue.decorators';
import { UUID } from 'node:crypto';
import { Job } from 'pg-boss';
import { EnrollmentEntity } from '../domain/enrollment.entity';
import {
  EnrollmentRepository,
  IEnrollmentRepository,
} from '../domain/enrollment.repository';

export interface EnrollStudentJob {
  purchaseId: UUID;
  studentId: UUID;
  courseId: UUID;
}

@Processor('enroll-student')
export class EnrollStudentProcessor extends JobWorker {
  constructor(
    @Inject(EnrollmentRepository)
    private readonly enrollmentRepository: IEnrollmentRepository,
  ) {
    super();
  }

  async process(job: Job<EnrollStudentJob>): Promise<any> {
    const enrollment = EnrollmentEntity.create({
      courseId: job.data.courseId,
      studentId: job.data.studentId,
    });
    await this.enrollmentRepository.save(enrollment);
  }
}
