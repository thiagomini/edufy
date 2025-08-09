import { randomUUID, UUID } from 'node:crypto';

export interface CreateCourseInput {
  title: string;
  description: string;
  price: number;
  id?: UUID;
  instructorId: UUID;
}

export interface CourseProps {
  id: UUID;
  title: string;
  description: string;
  price: number;
  instructorId: UUID;
}

export class CourseEntity {
  private constructor(
    public readonly id: UUID,
    public title: string,
    public description: string,
    public price: number,
    public readonly instructorId: UUID,
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
