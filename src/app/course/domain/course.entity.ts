import { randomUUID } from 'node:crypto';

export interface CreateCourseInput {
  title: string;
  description: string;
  price: number;
  id?: string;
  instructorId: string;
}

export interface CourseProps {
  id: string;
  title: string;
  description: string;
  price: number;
  instructorId: string;
}

export class CourseEntity {
  private constructor(
    public readonly id: string,
    public title: string,
    public description: string,
    public price: number,
    public readonly instructorId: string,
  ) {}

  public static create(input: CreateCourseInput): CourseEntity {
    return new CourseEntity(
      input.id ?? randomUUID(),
      input.title,
      input.description,
      input.price,
      input.instructorId,
    );
  }

  public static fromProps(props: CourseProps): CourseEntity {
    return new CourseEntity(
      props.id,
      props.title,
      props.description,
      props.price,
      props.instructorId,
    );
  }
}
