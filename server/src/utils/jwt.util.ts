import jwt, { SignOptions } from 'jsonwebtoken';
import { envConfig } from '../config/env.config.js';
import { UserRole } from '@prisma/client';

export interface AuthJwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export function signAccessToken(payload: AuthJwtPayload): string {
  const options: SignOptions = {
    expiresIn: envConfig.jwt.accessExpiresIn as unknown as number,
  };
  return jwt.sign(payload, envConfig.jwt.accessSecret, options);
}

export function signRefreshToken(payload: AuthJwtPayload): string {
  const options: SignOptions = {
    expiresIn: envConfig.jwt.refreshExpiresIn as unknown as number,
  };
  return jwt.sign(payload, envConfig.jwt.refreshSecret, options);
}

export function verifyAccessToken(token: string): AuthJwtPayload {
  return jwt.verify(token, envConfig.jwt.accessSecret) as AuthJwtPayload;
}

export function verifyRefreshToken(token: string): AuthJwtPayload {
  return jwt.verify(token, envConfig.jwt.refreshSecret) as AuthJwtPayload;
}
