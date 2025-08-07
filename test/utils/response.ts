export const response = {
  badRequest(message: string) {
    return {
      statusCode: 400,
      error: 'Bad Request',
      message,
    } as const;
  },
  notFound(message: string) {
    return {
      statusCode: 404,
      error: 'Not Found',
      message,
    } as const;
  },
  unauthorized(
    message: string = 'Authorization header is missing or malformed',
  ) {
    return {
      statusCode: 401,
      error: 'Unauthorized',
      message,
    } as const;
  },
  conflict(message: string) {
    return {
      statusCode: 409,
      error: 'Conflict',
      message,
    } as const;
  },
  forbidden(message: string) {
    return {
      statusCode: 403,
      error: 'Forbidden',
      message,
    } as const;
  },
  validationFailed(errors: string[]) {
    return {
      statusCode: 400,
      error: 'Bad Request',
      message: errors,
    } as const;
  },
};

export const validationErrors = {
  isNotEmpty: (field: string) => `${field} should not be empty` as const,
  isEmail: (field: string) => `${field} must be an email` as const,
  minLength: (field: string, length: number) =>
    `${field} must be longer than or equal to ${length} characters` as const,
  oneOfValues: (field: string, values: string[]) =>
    `${field} must be one of the following values: ${values.join(', ')}` as const,
  isUrl: (field: string) => `${field} must be a URL address` as const,
  isPositive: (field: string) => `${field} must be a positive number` as const,
  isUUID: (field: string) => `${field} must be a valid UUID` as const,
};
