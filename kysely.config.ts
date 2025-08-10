import {
  CamelCasePlugin,
  DeduplicateJoinsPlugin,
  PostgresDialect,
} from 'kysely';
import { defineConfig } from 'kysely-ctl';
import { Pool } from 'pg';

const databaseUrl = new URL(process.env.DATABASE_URL);
const testDatabaseUrl = new URL(process.env.DATABASE_URL);
testDatabaseUrl.pathname = '/test';

export default defineConfig({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: databaseUrl.toString(),
    }),
  }),
  migrations: {
    migrationFolder: './database/migrations',
  },
  plugins: [new CamelCasePlugin(), new DeduplicateJoinsPlugin()],
  $env: {
    test: {
      dialect: new PostgresDialect({
        pool: new Pool({
          connectionString: testDatabaseUrl.toString(),
        }),
      }),
    },
  },
});
