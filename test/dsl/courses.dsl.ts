import { faker } from '@faker-js/faker';
import { CourseReadDto } from '@src/app/course/presentation/course.read-dto';
import { CreateCourseDto } from '@src/app/course/presentation/create-course.dto';
import { DATABASE } from '@src/libs/database/constants';
import { Database } from '@src/libs/database/database.type';
import { sql } from 'kysely';
import { UUID } from 'node:crypto';
import { AbstractDSL } from './abstract.dsl';

export class CoursesDSL extends AbstractDSL {
  create(courseData: CreateCourseDto) {
    return this.req().post('/courses').set(this.headers).send(courseData);
  }

  async createRandomCourse(
    partial: Partial<CreateCourseDto> = {},
  ): Promise<CourseReadDto> {
    const defaultCourseData: CreateCourseDto = {
      title: `${faker.hacker.noun()} Course`,
      description: faker.lorem.paragraph(),
      price: faker.number.int({ min: 100, max: 500 }),
    };
    return this.req()
      .post('/courses')
      .set(this.headers)
      .send({
        ...defaultCourseData,
        ...partial,
      })
      .expect(201)
      .then((res) => res.body);
  }

  async createMany(courses: CreateCourseDto[]) {
    const newCourses = await Promise.all(
      courses.map((course) =>
        this.create(course)
          .expect(201)
          .then((res) => res.body),
      ),
    );
    return newCourses;
  }

  getById(courseId: string) {
    return this.req().get(`/courses/${courseId}`).set(this.headers);
  }

  getAll() {
    return this.req().get('/courses').set(this.headers);
  }

  getLecturedByUser(userId: string) {
    return this.req().get(`/users/${userId}/courses`).set(this.headers);
  }

  checkout(courseId: string) {
    return this.req().post(`/courses/${courseId}/checkout`).set(this.headers);
  }

  getPurchaseById(purchaseId: UUID) {
    return this.req().get(`/purchases/${purchaseId}`).set(this.headers);
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
