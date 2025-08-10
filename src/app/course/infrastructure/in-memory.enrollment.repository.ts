import { Injectable } from '@nestjs/common';
import { EnrollmentEntity } from '../domain/enrollment.entity';
import { IEnrollmentRepository } from '../domain/enrollment.repository';

@Injectable()
export class InMemoryEnrollmentRepository implements IEnrollmentRepository {
  private readonly enrollments: EnrollmentEntity[] = [];

  async save(enrollment: EnrollmentEntity): Promise<void> {
    const existingIndex = this.enrollments.findIndex(
      (e) =>
        e.courseId === enrollment.courseId &&
        e.studentId === enrollment.studentId,
    );
    if (existingIndex !== -1) {
      this.enrollments[existingIndex] = enrollment;
    } else {
      this.enrollments.push(enrollment);
    }
  }

  findAllByStudentId(studentId: string): Promise<EnrollmentEntity[]> {
    return Promise.resolve(
      this.enrollments.filter((e) => e.studentId === studentId),
    );
  }
}
