import { Database } from '@src/libs/database/database.type';
import { EnrollmentEntity } from '../domain/enrollment.entity';
import { IEnrollmentRepository } from '../domain/enrollment.repository';
import { Inject } from '@nestjs/common';
import { DATABASE } from '@src/libs/database/constants';
import { UUID } from 'node:crypto';

export class KyselyEnrollmentRepository implements IEnrollmentRepository {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async save(enrollment: EnrollmentEntity): Promise<void> {
    await this.database.insertInto('enrollment').values(enrollment).execute();
  }
  async findAllByStudentId(studentId: string): Promise<EnrollmentEntity[]> {
    const result = await this.database
      .selectFrom('enrollment')
      .selectAll()
      .where('studentId', '=', studentId)
      .$narrowType<{
        courseId: UUID;
        studentId: UUID;
      }>()
      .execute();

    return result.map((row) => EnrollmentEntity.fromProps(row));
  }
}
