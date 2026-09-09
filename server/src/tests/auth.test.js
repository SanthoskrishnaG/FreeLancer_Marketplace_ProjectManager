import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from '../utils/bcrypt.util.js';
import { signAccessToken, verifyAccessToken } from '../utils/jwt.util.js';

describe('Authentication Utilities (JWT & Bcrypt)', () => {
  it('should hash a password and verify matching hash', async () => {
    const raw = 'SuperSecurePass123!';
    const hashed = await hashPassword(raw);

    expect(hashed).toBeTypeOf('string');
    expect(hashed).not.toBe(raw);

    const isMatch = await comparePassword(raw, hashed);
    expect(isMatch).toBe(true);

    const isWrongMatch = await comparePassword('WrongPassword', hashed);
    expect(isWrongMatch).toBe(false);
  });

  it('should sign and verify JWT tokens containing user identity and role', () => {
    const payload = {
      id: 'uuid-1234-test',
      email: 'alex@marketplace.com',
      role: 'FREELANCER',
    };

    const token = signAccessToken(payload);
    expect(token).toBeTypeOf('string');

    const decoded = verifyAccessToken(token);
    expect(decoded.id).toBe(payload.id);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });
});
