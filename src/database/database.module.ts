import { Global, Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { databaseProvider } from './database.provider';
import { Database } from './database.type';
import { DATABASE } from './constants';

@Global()
@Module({
  imports: [],
  providers: [databaseProvider],
  exports: [databaseProvider],
})
export class DatabaseModule implements OnModuleDestroy {
  constructor(
    @Inject(DATABASE)
    private readonly database: Database,
  ) {}
  async onModuleDestroy() {
    await this.database.destroy();
  }
}
