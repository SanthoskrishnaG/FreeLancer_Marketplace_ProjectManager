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

/**
 * Ensures a PostgreSQL database is available for local development.
 * In PRODUCTION (Render / Cloud), this function is completely bypassed.
 * The production environment connects strictly via the external DATABASE_URL provided by Render.
 */
export async function ensureDatabase() {
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    Boolean(process.env.RENDER) ||
    Boolean(process.env.IS_RENDER);

  const databaseUrl = process.env.DATABASE_URL || '';
  const isRemoteDb =
    databaseUrl &&
    !databaseUrl.includes('localhost') &&
    !databaseUrl.includes('127.0.0.1');

  // In production or when connecting to any remote PostgreSQL host, DO NOT touch or start embedded Postgres
  if (isProduction || isRemoteDb) {
    return;
  }

  // Check if a local PostgreSQL service is already active on port 5432
  const isOpen = await isPortOpen(5432);
  if (isOpen) {
    return;
  }

  // Local development only: dynamically load embedded-postgres if available
  try {
    const { default: EmbeddedPostgres } = await import('embedded-postgres');
    console.log('📦 [Dev Only] Starting local embedded PostgreSQL on port 5432...');
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
    console.log('✅ [Dev Only] Local PostgreSQL active on port 5432');
  } catch (err) {
    console.warn(`⚠️ [Dev Only] Embedded PostgreSQL unavailable or skipped: ${err.message}`);
    console.warn(
      `ℹ️ [Dev Notice] If embedded PostgreSQL is not installed, please ensure a standard PostgreSQL server is running on port 5432.\n` +
      `   Alternatively, configure DATABASE_URL in server/.env to point to your PostgreSQL instance.\n` +
      `   Example: DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/freelancer_marketplace?schema=public"`
    );
  }
}

export default ensureDatabase;
