import { BadRequestException, ParseUUIDPipe } from '@nestjs/common';

export function parseUUIDWithMessage(message: string) {
  return new ParseUUIDPipe({
    exceptionFactory: () => {
      return new BadRequestException(message);
    },
  });
}
