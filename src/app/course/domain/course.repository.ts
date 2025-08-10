import { UUID } from 'node:crypto';
import { CourseEntity } from './course.entity';

export interface ICourseRepository {
  save(course: CourseEntity): Promise<void>;
  findOneById(id: string): Promise<CourseEntity | null>;
  findAllLecturedBy(userId: UUID): Promise<CourseEntity[]>;
  findAllEnrolledBy(userId: UUID): Promise<CourseEntity[]>;
  findAll(): Promise<CourseEntity[]>;
}

export const CourseRepository = Symbol.for('course:ICourseRepository');
