import { KyselyRepository } from '@src/libs/database/kysely.repository';
import { UUID } from 'node:crypto';
import { EnrollmentEntity } from '../domain/enrollment.entity';
import { IEnrollmentRepository } from '../domain/enrollment.repository';

export class KyselyEnrollmentRepository
  extends KyselyRepository
  implements IEnrollmentRepository
{
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
