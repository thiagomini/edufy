import { Expose } from 'class-transformer';
import { UserProps } from '../../domain/user.entity';
import { UserRole, UserRoleEnum } from '../../domain/user.role';

export interface CreateUserReadDtoInput extends UserProps {
  ticketsResolved?: number;
}

export class UserReadDto {
  id: string;
  name: string;
  email: string;
  role: UserRoleEnum;
  biography?: string;
  interests?: string[];
  profilePictureUrl?: string;

  @Expose({ groups: [UserRole.SupportAgent] })
  ticketsResolved: number;

  constructor(user: CreateUserReadDtoInput) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.role = user.role;
    this.biography = user.biography;
    this.interests = user.interests;
    this.profilePictureUrl = user.profilePictureUrl;
    this.ticketsResolved = user.ticketsResolved;
  }
}
