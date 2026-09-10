import http from 'http';
import { createApp } from './app.js';
import { envConfig } from './config/env.config.js';
import { prisma } from './config/database.js';
import { logger } from './utils/logger.js';
import { SocketServer } from './socket/socket.server.js';

const app = createApp();
const httpServer = http.createServer(app);

// Initialize real-time Socket.IO server
SocketServer.initialize(httpServer);

const startServer = async (): Promise<void> => {
  try {
    // Verify database connection
    await prisma.$connect();
    logger.info('Database connection established successfully');

    httpServer.listen(envConfig.port, () => {
      logger.info(
        `Server & WebSocket listening on port ${envConfig.port} in ${envConfig.nodeEnv} mode`
      );
      logger.info(`Health check available at http://localhost:${envConfig.port}/api/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected.');
    process.exit(0);
  } catch (err) {
    logger.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
