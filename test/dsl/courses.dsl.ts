import { AbstractDSL } from './abstract.dsl';

export class CoursesDSL extends AbstractDSL {
  create(courseData: any) {
    return this.req().post('/courses').set(this.headers).send(courseData);
  }
}
