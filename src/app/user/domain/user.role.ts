export const UserRole = {
  Student: 'student',
  SupportAgent: 'support_agent',
  Instructor: 'instructor',
} as const;

export type UserRoleEnum = (typeof UserRole)[keyof typeof UserRole];
