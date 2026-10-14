import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import app, { parseAllowedOrigins } from './app.js';
import { env } from './config/env.config.js';
import { setupSocketIO } from './socket/socketHandler.js';
import prisma from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const server = http.createServer(app);

// Initialize Socket.IO with production-safe CORS
const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.trim().replace(/\/+$/, '');
      const allowed = parseAllowedOrigins();
      if (allowed.includes(cleanOrigin) || env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return callback(
        new Error(`Socket.IO CORS error: Origin ${origin} is not allowed by WorkPulse security policy`)
      );
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Setup socket events
const socketManager = setupSocketIO(io);

// Expose socketManager to app
app.set('socketManager', socketManager);

const PORT = Number(process.env.PORT) || 5000;
const HOST = '0.0.0.0';

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use (EADDRINUSE). Please verify whether an existing instance is running.`);
  } else {
    console.error('❌ Server startup error:', err.message);
  }
  process.exit(1);
});

// Start initialization sequence: Database connectivity check MUST complete before opening port
async function startServer() {
  try {
    // In local development only, attempt auto-starting local DB if needed
    if (process.env.NODE_ENV !== 'production' && !process.env.RENDER) {
      try {
        const { ensureDatabase } = await import('./config/ensureDb.js');
        await ensureDatabase();
      } catch (err) {
        console.warn('⚠️ [Dev Only] Local DB auto-starter skipped:', err.message);
      }
    }

    // Connect to PostgreSQL database via Prisma
    console.log('🔄 Connecting to PostgreSQL database via Prisma...');
    await prisma.$connect();
    // Quick test query to verify table accessibility
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Connected to PostgreSQL database via Prisma');

    // Bind HTTP & WebSocket server to 0.0.0.0 on assigned PORT
    server.listen(PORT, HOST, () => {
      console.log(`🚀 WorkPulse AI Server active in ${env.NODE_ENV} mode at http://${HOST}:${PORT}`);
      console.log(`📡 WebSocket server running on port ${PORT}`);
      console.log(`📁 Uploads served from ${uploadsDir}`);
    });
  } catch (err) {
    console.error('❌ Fatal startup error: Database connection could not be established.');
    console.error(`Reason: ${err.message}`);
    // Safe shutdown when database is unavailable in production
    process.exit(1);
  }
}

startServer();

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Stopping WorkPulse server gracefully...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log('Closed HTTP server and PostgreSQL connections. Exiting process safely.');
    } catch (_e) {
      // ignore on exit
    }
    process.exit(0);
  });

  // Force exit after 10s if connections refuse to close
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
