import jwt from 'jsonwebtoken';
import { envConfig } from '../config/env.config.js';

export function signAccessToken(payload) {
  return jwt.sign(payload, envConfig.jwt.accessSecret, {
    expiresIn: envConfig.jwt.accessExpiresIn,
  });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, envConfig.jwt.refreshSecret, {
    expiresIn: envConfig.jwt.refreshExpiresIn,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, envConfig.jwt.accessSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, envConfig.jwt.refreshSecret);
}
