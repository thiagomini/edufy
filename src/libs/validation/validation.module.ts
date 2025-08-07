import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ZodErrorExceptionFilter } from './zod-error.exception-filter';

@Module({
  providers: [
    ZodErrorExceptionFilter,
    {
      provide: APP_FILTER,
      useClass: ZodErrorExceptionFilter,
    },
  ],
  exports: [ZodErrorExceptionFilter],
})
export class ValidationModule {}
