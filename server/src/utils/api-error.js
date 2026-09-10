export class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, details = null, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    this.code = code || `HTTP_${statusCode}`;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad Request', details = null, code = 'BAD_REQUEST') {
    return new ApiError(400, message, true, details, code);
  }

  static unauthorized(message = 'Unauthorized', details = null, code = 'UNAUTHORIZED') {
    return new ApiError(401, message, true, details, code);
  }

  static forbidden(message = 'Forbidden', details = null, code = 'FORBIDDEN') {
    return new ApiError(403, message, true, details, code);
  }

  static notFound(message = 'Resource not found', details = null, code = 'NOT_FOUND') {
    return new ApiError(404, message, true, details, code);
  }

  static conflict(message = 'An account with this email already exists.', details = null, code = 'EMAIL_ALREADY_EXISTS') {
    return new ApiError(409, message, true, details, code);
  }

  static internal(message = 'Internal Server Error', details = null, code = 'INTERNAL_ERROR') {
    return new ApiError(500, message, false, details, code);
  }
}

export default ApiError;
