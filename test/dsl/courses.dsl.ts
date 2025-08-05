import { CreateCourseDto } from '@src/app/course/presentation/create-course.dto';
import { AbstractDSL } from './abstract.dsl';

export class CoursesDSL extends AbstractDSL {
  create(courseData: CreateCourseDto) {
    return this.req().post('/courses').set(this.headers).send(courseData);
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
}
