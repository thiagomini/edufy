import { EnrollmentEntity } from './enrollment.entity';

export interface IEnrollmentRepository {
  save(enrollment: EnrollmentEntity): Promise<void>;
  findAllByStudentId(studentId: string): Promise<EnrollmentEntity[]>;
}

export const EnrollmentRepository = Symbol.for('course:IEnrollmentRepository');
