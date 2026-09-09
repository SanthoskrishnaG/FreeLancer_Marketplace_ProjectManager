import { verifyAccessToken } from '../utils/jwt.util.js';
import { ApiError } from '../utils/api-error.js';

export const requireAuth = (req, _res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw ApiError.unauthorized('Authentication required. Please log in.');
    }

    const decoded = verifyAccessToken(token);
    // Ensure both id and userId exist
    if (!decoded.id && decoded.userId) decoded.id = decoded.userId;
    if (!decoded.userId && decoded.id) decoded.userId = decoded.id;

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(ApiError.unauthorized('Invalid or expired authentication token.'));
    }
  }
};

export const requireRole = (...allowedRoles) => {
  const allowed = allowedRoles.flat();
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required.'));
    }

    if (!allowed.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Allowed roles: ${allowed.join(', ')}. Current role: ${req.user.role}`
        )
      );
    }

    next();
  };
};

export const authenticate = requireAuth;
export const authorize = requireRole;

export const optionalAuth = (req, _res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      if (!decoded.id && decoded.userId) decoded.id = decoded.userId;
      if (!decoded.userId && decoded.id) decoded.userId = decoded.id;
      req.user = decoded;
    }
  } catch {
    // Ignore invalid tokens for optional auth
  }
  next();
};
