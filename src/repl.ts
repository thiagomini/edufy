import { repl } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const replServer = await repl(AppModule);
  replServer.setupHistory('.nestjs_repl_history', (err) => {
    if (err) {
      console.error(err);
    }
  });
}
bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
