import { CourseEntity } from '../domain/course.entity';

export class CourseReadDto {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  price: number;

  constructor(courseEntity: CourseEntity) {
    this.id = courseEntity.id;
    this.title = courseEntity.title;
    this.description = courseEntity.description;
    this.instructorId = courseEntity.instructorId;
    this.price = courseEntity.price;
  }
}
