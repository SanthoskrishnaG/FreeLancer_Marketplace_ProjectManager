import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { envConfig } from './config/env.config.js';
import { requestLogger, errorHandler, notFoundHandler } from './middleware/index.js';
import apiRoutes from './routes/index.js';

export function createApp(): Express {
  const app = express();

  // Core Middlewares
  app.use(
    cors({
      origin: envConfig.clientUrl,
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging Middleware
  app.use(requestLogger);

  // Mount API routes at /api
  app.use('/api', apiRoutes);

  // 404 Route Handler
  app.use(notFoundHandler);

  // Global Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
export default app;
