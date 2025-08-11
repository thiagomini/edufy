import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { configServer } from './server-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  configServer(app);
  await app.listen(3000);
}
bootstrap();
