import { INestApplication, ValidationPipe } from '@nestjs/common';

export function configServer(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
}
