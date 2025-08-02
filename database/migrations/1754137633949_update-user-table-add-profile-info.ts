import { sql, type Kysely } from 'kysely';

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  return db.schema
    .alterTable('user')
    .addColumn('biography', 'text')
    .addColumn('interests', 'jsonb', (col) => col.defaultTo(sql`'[]'::jsonb`))
    .addColumn('profilePictureUrl', 'text')
    .execute();
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  return db.schema
    .alterTable('user')
    .dropColumn('biography')
    .dropColumn('interests')
    .dropColumn('profilePictureUrl')
    .execute();
}
