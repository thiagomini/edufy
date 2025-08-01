import { DB } from '@src/database/generated/db';
import { CamelCasePlugin, Kysely, PostgresDialect, sql } from 'kysely';
import { Pool } from 'pg';
import { loadEnvFile } from 'process';

loadEnvFile();

export default async function clearDatabase() {
  const tables = ['public.user', 'public.ticket'] as const;
  const dialect = new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  });

  console.log('\n');
  console.log('➡️  Connecting to Database...');
  const db = new Kysely<DB>({
    dialect,
    plugins: [new CamelCasePlugin()],
  });
  console.log('✅ Database Connected');
  console.log('🗑️  Truncating Database...');
  await db.executeQuery(
    sql`TRUNCATE TABLE ${sql.raw(tables.join(', '))} RESTART IDENTITY CASCADE`.compile(
      db,
    ),
  );
  console.log('✅ Database Truncated');
  console.log('🔚 Closing Database Connection...');
  await db.destroy();
  console.log('✅ Database Connection Closed');
}
