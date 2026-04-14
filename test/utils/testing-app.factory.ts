import { Type } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@src/app/app.module';
import { configServer } from '@src/server-config';

export interface TestApplicationSetupOptions {
  imports?: Type<unknown>[];
}

export async function createTestingApp(
  options: TestApplicationSetupOptions = {},
) {
  const additionalImports: Type<unknown>[] = options.imports ?? [];
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule, ...additionalImports],
  }).compile();
  const app = moduleFixture
    .createNestApplication({
      rawBody: true,
    })
    .enableShutdownHooks();
  configServer(app);
  await app.init();
  return app;
}
