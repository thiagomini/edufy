import { Inject, Injectable } from '@nestjs/common';
import { CourseEntity } from '../domain/course.entity';
import { ICourseRepository } from '../domain/course.repository';
import { DATABASE } from '@src/libs/database/constants';
import { Database } from '@src/libs/database/database.type';
import { Selectable } from 'kysely';
import { Course } from '@src/libs/database/generated/db';

@Injectable()
export class KyselyCourseRepository implements ICourseRepository {
  constructor(
    @Inject(DATABASE)
    private readonly database: Database,
  ) {}

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
      id: courseInDb.id,
      title: courseInDb.title,
      description: courseInDb.description,
      price: +courseInDb.price,
      instructorId: courseInDb.instructorId,
    });
  }
}
