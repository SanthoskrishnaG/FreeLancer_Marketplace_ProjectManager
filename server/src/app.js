import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import { env } from './config/env.config.js';
import { setupSwagger } from './config/swagger.js';
import prisma from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Resolve allowed CORS origins safely for production and local development
export const parseAllowedOrigins = () => {
  const allowed = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
  ];

  const clientUrl = process.env.CLIENT_URL || env.CLIENT_URL;
  if (clientUrl) {
    clientUrl.split(',').forEach((url) => {
      const clean = url.trim().replace(/\/+$/, '');
      if (clean) allowed.push(clean);
    });
  }
  return [...new Set(allowed)];
};

// CORS setup
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server, Render health checks)
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.trim().replace(/\/+$/, '');
      const allowed = parseAllowedOrigins();

      if (allowed.includes(cleanOrigin) || env.NODE_ENV === 'development') {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS violation: Origin ${origin} is not allowed by WorkPulse security policy`)
      );
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body parsing
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Health check endpoint (checks both API process and PostgreSQL database connectivity)
const healthHandler = async (_req, res) => {
  try {
    // Quick probe to ensure PostgreSQL is reachable
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      status: 'healthy',
      success: true,
      message: 'WorkPulse API and Database operational',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: Math.floor(process.uptime()),
    });
  } catch (_err) {
    return res.status(503).json({
      status: 'unhealthy',
      success: false,
      message: 'Database connectivity probe failed',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    });
  }
};

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Swagger Documentation
setupSwagger(app);

// API routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found on this server`,
  });
});

// Centralized error handling
app.use(errorHandler);

export function createApp() {
  return app;
}

export { app };
export default app;
