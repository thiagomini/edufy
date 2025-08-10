import type { Kysely } from 'kysely';

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('enrollment')
    .addColumn('student_id', 'uuid', (col) =>
      col.notNull().references('user.id'),
    )
    .addColumn('course_id', 'uuid', (col) =>
      col.notNull().references('course.id'),
    )
    .addColumn('enrolled_at', 'timestamptz', (col) => col.notNull())
    .addPrimaryKeyConstraint('pk_enrollment', ['student_id', 'course_id'])
    .execute();
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('enrollment').execute();
}
