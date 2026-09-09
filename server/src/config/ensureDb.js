import EmbeddedPostgres from 'embedded-postgres';
import path from 'path';
import { fileURLToPath } from 'url';
import net from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function isPortOpen(port = 5432, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

export async function ensureDatabase() {
  const isOpen = await isPortOpen(5432);
  if (isOpen) {
    return;
  }

  console.log('📦 Starting local embedded PostgreSQL on port 5432...');
  const dbDir = path.join(__dirname, '../../../.pgdata');
  const pg = new EmbeddedPostgres({
    databaseDir: dbDir,
    user: 'postgres',
    password: 'postgrespassword',
    port: 5432,
    persistent: true,
  });

  try {
    await pg.initialise();
  } catch (_e) {
    // already initialized
  }

  await pg.start();
  try {
    await pg.createDatabase('freelancer_marketplace');
  } catch (_e) {
    // already created
  }
  console.log('✅ Local PostgreSQL active on port 5432');
}
