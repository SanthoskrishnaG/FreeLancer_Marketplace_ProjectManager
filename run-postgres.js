import EmbeddedPostgres from 'embedded-postgres';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.join(__dirname, '.pgdata');
const pg = new EmbeddedPostgres({
  databaseDir: dbDir,
  user: 'postgres',
  password: 'postgrespassword',
  port: 5432,
  persistent: true,
});

async function main() {
  try {
    await pg.initialise();
  } catch (_e) {}
  await pg.start();
  try {
    await pg.createDatabase('freelancer_marketplace');
  } catch (_e) {}
  console.log('READY_POSTGRES_5432');
}

main().catch((err) => {
  console.error('PG start error:', err);
  process.exit(1);
});
