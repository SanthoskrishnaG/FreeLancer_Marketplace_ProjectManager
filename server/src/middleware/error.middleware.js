import { ApiError } from '../utils/api-error.js';
import { ZodError } from 'zod';

export const errorHandler = (err, _req, res, _next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: {
        code: err.code || `HTTP_${err.statusCode}`,
        message: err.message,
        details: err.details,
      },
    });
  }

  if (err instanceof ZodError) {
    const errorMsg = 'Validation failed: ' + err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    return res.status(400).json({
      success: false,
      message: errorMsg,
      error: {
        code: 'VALIDATION_ERROR',
        message: errorMsg,
        details: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
    });
  }

  console.error('Unhandled Server Error:', err);

  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Something went wrong. Please try again.'
      : err.message || 'Something went wrong. Please try again.';

  return res.status(statusCode).json({
    success: false,
    message,
    error: {
      code: 'INTERNAL_ERROR',
      message,
    },
  });
};

export const notFoundHandler = (req, _res, next) => {
  next(ApiError.notFound(`Endpoint not found: ${req.method} ${req.originalUrl}`));
};
