import { INestApplication, ValidationPipe } from '@nestjs/common';

export function configServer(app: INestApplication) {
  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
}
