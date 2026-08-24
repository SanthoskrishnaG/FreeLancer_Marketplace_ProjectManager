import { PrismaClient } from '@prisma/client';
import { envConfig } from './env.config.js';
import { logger } from '../utils/logger.js';

// PrismaClient singleton instance
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: envConfig.isDevelopment ? ['query', 'error', 'warn'] : ['error'],
  });

if (!envConfig.isProduction) {
  globalForPrisma.prisma = prisma;
}

export async function connectDatabase(): Promise<boolean> {
  try {
    await prisma.$connect();
    logger.info('🐘 PostgreSQL database connected successfully via Prisma.');
    return true;
  } catch (error) {
    logger.error('❌ Failed to connect to PostgreSQL database:', error);
    return false;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('🐘 PostgreSQL database disconnected.');
}

export default prisma;
