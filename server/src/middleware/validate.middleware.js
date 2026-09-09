import { ApiError } from '../utils/api-error.js';

export const validate = (schema) => (req, _res, next) => {
  try {
    if (!schema || typeof schema.safeParse !== 'function') {
      return next();
    }

    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errorMessages = result.error.errors.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      );
      return next(
        ApiError.badRequest(
          `Validation error: ${errorMessages.join(', ')}`,
          result.error.errors
        )
      );
    }

    req.body = result.data;
    next();
  } catch (error) {
    next(error);
  }
};
