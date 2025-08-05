import { AbstractDSL } from './abstract.dsl';

export class CoursesDSL extends AbstractDSL {
  create(courseData: any) {
    return this.req().post('/courses').set(this.headers).send(courseData);
  }

  getById(courseId: string) {
    return this.req().get(`/courses/${courseId}`).set(this.headers);
  }

  getLecturedByUser(userId: string) {
    return this.req().get(`/users/${userId}/courses`).set(this.headers);
  }
}
