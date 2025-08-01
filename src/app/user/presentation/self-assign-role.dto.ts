import { IsIn } from 'class-validator';

export class SelfAssignRoleDto {
  @IsIn(['student', 'instructor'])
  role: 'student' | 'instructor';
}
