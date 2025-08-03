import { CourseEntity } from './course.entity';

export interface ICourseRepository {
  save(course: CourseEntity): Promise<void>;
  findOneById(id: string): Promise<CourseEntity | null>;
}

export const CourseRepository = Symbol.for('course:ICourseRepository');
