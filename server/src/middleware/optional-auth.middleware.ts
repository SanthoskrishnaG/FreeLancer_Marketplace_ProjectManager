import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.util.js';

export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
    }
  } catch {
    // Silently continue without authenticated user
  }
  next();
};
