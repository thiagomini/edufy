import { UUID } from 'node:crypto';

export interface CreateEnrollmentInput {
  courseId: UUID;
  studentId: UUID;
}

export interface EnrollmentProps {
  courseId: UUID;
  studentId: UUID;
  enrolledAt: Date;
}

export class EnrollmentEntity {
  private constructor(
    public readonly courseId: UUID,
    public readonly studentId: UUID,
    public readonly enrolledAt: Date,
  ) {}

  public static create(input: CreateEnrollmentInput): EnrollmentEntity {
    return new EnrollmentEntity(input.courseId, input.studentId, new Date());
  }

  public static fromProps(props: EnrollmentProps): EnrollmentEntity {
    return new EnrollmentEntity(
      props.courseId,
      props.studentId,
      props.enrolledAt,
    );
  }
}
