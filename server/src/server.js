import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './app.js';
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

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Setup socket events
const socketManager = setupSocketIO(io);

// Expose socketManager to app
app.set('socketManager', socketManager);

const PORT = env.PORT || 5000;

server.listen(PORT, async () => {
  console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📡 WebSocket server running on port ${PORT}`);
  console.log(`📁 Uploads served from ${uploadsDir}`);

  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL database via Prisma');
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
  }
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Stopping server gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Closed HTTP server and DB connections. Exiting process.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
