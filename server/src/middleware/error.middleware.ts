import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ApiError } from '../utils/api-error.js';
import { logger } from '../utils/logger.js';
import { envConfig } from '../config/env.config.js';

export const errorHandler: ErrorRequestHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  if (err instanceof ApiError) {
    logger.warn(`Operational Error: ${err.statusCode} - ${err.message}`);
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
      ...(envConfig.isDevelopment ? { stack: err.stack } : {}),
    });
    return;
  }

  logger.error('Unhandled Application Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    ...(envConfig.isDevelopment ? { stack: err.stack, details: err.message } : {}),
  });
};
