import {
  CamelCasePlugin,
  DeduplicateJoinsPlugin,
  PostgresDialect,
} from 'kysely';
import { defineConfig } from 'kysely-ctl';
import { Pool } from 'pg';

export default defineConfig({
  dialect: () => {
    const databaseUrl = new URL(process.env.DATABASE_URL);
    return new PostgresDialect({
      pool: new Pool({
        connectionString: databaseUrl.toString(),
      }),
    });
  },
  migrations: {
    migrationFolder: './database/migrations',
  },
  plugins: [new CamelCasePlugin(), new DeduplicateJoinsPlugin()],
  $env: {
    test: {
      dialect: () => {
        const testDatabaseUrl = new URL(process.env.DATABASE_URL);
        testDatabaseUrl.pathname = '/test';
        return new PostgresDialect({
          pool: new Pool({
            connectionString: testDatabaseUrl.toString(),
          }),
        });
      },
    },
  },
});
