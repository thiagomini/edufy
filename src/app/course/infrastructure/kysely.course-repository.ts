import { Injectable } from '@nestjs/common';
import { Course } from '@src/libs/database/generated/db';
import { KyselyRepository } from '@src/libs/database/kysely.repository';
import { UUID } from 'crypto';
import { Selectable } from 'kysely';
import { CourseEntity } from '../domain/course.entity';
import { ICourseRepository } from '../domain/course.repository';

@Injectable()
export class KyselyCourseRepository
  extends KyselyRepository
  implements ICourseRepository
{
  async findAll(): Promise<CourseEntity[]> {
    return await this.database
      .selectFrom('course')
      .selectAll()
      .execute()
      .then((courses) => courses.map(this.mapToCourseEntity));
  }

  async findAllLecturedBy(userId: string): Promise<CourseEntity[]> {
    return await this.database
      .selectFrom('course')
      .selectAll()
      .where('instructorId', '=', userId)
      .execute()
      .then((courses) => courses.map(this.mapToCourseEntity));
  }

  async findAllEnrolledBy(userId: UUID): Promise<CourseEntity[]> {
    return await this.database
      .selectFrom('course')
      .selectAll('course')
      .innerJoin('enrollment', (join) =>
        join
          .onRef('course.id', '=', 'enrollment.courseId')
          .on('enrollment.studentId', '=', userId),
      )
      .execute()
      .then((courses) =>
        courses.map((course) => this.mapToCourseEntity(course)),
      );
  }

  async save(course: CourseEntity): Promise<void> {
    await this.database
      .insertInto('course')
      .values({
        id: course.id,
        title: course.title,
        description: course.description,
        price: course.price,
        instructorId: course.instructorId,
      })
      .onConflict((oc) =>
        oc.column('id').doUpdateSet({
          description: course.description,
          title: course.title,
          price: course.price,
          instructorId: course.instructorId,
          updatedAt: new Date(),
        }),
      )
      .executeTakeFirstOrThrow();
  }
  async findOneById(id: string): Promise<CourseEntity | null> {
    return await this.database
      .selectFrom('course')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst()
      .then((courseInDb) => this.mapToCourseEntity(courseInDb));
  }

  private mapToCourseEntity(
    courseInDb: Selectable<Course>,
  ): CourseEntity | null {
    if (!courseInDb) {
      return null;
    }
    return CourseEntity.fromProps({
      id: courseInDb.id as UUID,
      title: courseInDb.title,
      description: courseInDb.description,
      price: +courseInDb.price,
      instructorId: courseInDb.instructorId as UUID,
    });
  }
}
