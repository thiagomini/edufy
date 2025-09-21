import { DATABASE } from '@src/libs/database/constants';
import { Database } from '@src/libs/database/database.type';
import { sql } from 'kysely';
import { AbstractDSL } from './abstract.dsl';

export class CoursesDSL extends AbstractDSL {
  getById(courseId: string) {
    return this.req().get(`/courses/${courseId}`).set(this.headers);
  }

  getAll() {
    return this.req().get('/courses').set(this.headers);
  }

  getAllByUser() {
    return this.req().get('/users/me/courses').set(this.headers);
  }

  checkout(courseId: string) {
    return this.req().post(`/courses/${courseId}/checkout`).set(this.headers);
  }

  async deleteAllCourses() {
    const database = this.app.get<Database>(DATABASE);
    await database.executeQuery(
      sql`TRUNCATE TABLE public.course RESTART IDENTITY CASCADE`.compile(
        database,
      ),
    );
  }
}
