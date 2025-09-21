import PgBoss from 'pg-boss';

async function migrate() {
  const boss = new PgBoss({
    connectionString: process.env.DATABASE_URL,
  });

  console.debug('Migrating PgBoss Schema...');
  await boss.start();
  console.debug('PGBoss Schema migrated successfully!');

  console.debug('Stopping PgBoss...');
  await boss.stop();
  console.debug('PgBoss stopped successfully!');
}

migrate().catch((error) => {
  console.error('Error during PgBoss schema migration:', error);
  process.exit(1);
});
