import { sql, type Kysely } from 'kysely';

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  return db.schema
    .alterTable('ticket')
    .addColumn('replies', 'jsonb', (col) => col.defaultTo(sql`'[]'::jsonb`))
    .execute();
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  return db.schema.alterTable('ticket').dropColumn('replies').execute();
}
