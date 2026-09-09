export class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad Request', details = null) {
    return new ApiError(400, message, true, details);
  }

  static unauthorized(message = 'Unauthorized', details = null) {
    return new ApiError(401, message, true, details);
  }

  static forbidden(message = 'Forbidden', details = null) {
    return new ApiError(403, message, true, details);
  }

  static notFound(message = 'Resource not found', details = null) {
    return new ApiError(404, message, true, details);
  }

  static conflict(message = 'Resource conflict', details = null) {
    return new ApiError(409, message, true, details);
  }

  static internal(message = 'Internal Server Error', details = null) {
    return new ApiError(500, message, false, details);
  }
}

export default ApiError;
