import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { UserRepository } from '../repositories/user.repository.js';
import { hashPassword, comparePassword } from '../utils/password.util.js';
import { signAccessToken, verifyAccessToken } from '../utils/jwt.util.js';
import { UserRole } from '@prisma/client';

describe('Authentication & Security Suite', () => {
  const app = createApp();

  describe('Password Hashing Utility', () => {
    it('should hash passwords securely and verify match correctly', async () => {
      const password = 'SecurePassword123!';
      const hash = await hashPassword(password);

      expect(hash).not.toBe(password);
      expect(hash.startsWith('$2')).toBe(true);

      const isValid = await comparePassword(password, hash);
      const isInvalid = await comparePassword('WrongPassword123!', hash);

      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });
  });

  describe('JWT Utility', () => {
    it('should sign and verify access tokens with payload', () => {
      const payload = {
        userId: 'test-uuid-123',
        email: 'test@example.com',
        role: UserRole.FREELANCER,
      };

      const token = signAccessToken(payload);
      expect(typeof token).toBe('string');

      const decoded = verifyAccessToken(token);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });
  });

  describe('Health API Check', () => {
    it('GET /api/health should return status 200 and success message', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: 'API is running',
      });
    });
  });

  describe('Auth Endpoints Validation & Security', () => {
    it('POST /api/auth/register should fail when validation rules are violated', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'invalid-email',
        password: '123', // Too short, no uppercase
        firstName: '',
        lastName: '',
        role: 'SUPERADMIN', // Invalid role enum
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Validation');
    });

    it('POST /api/auth/login should fail with 400 if fields are missing', async () => {
      const res = await request(app).post('/api/auth/login').send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/auth/me should return 401 when no token is provided', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Authentication required');
    });

    it('GET /api/auth/me should return 401 when an invalid token is provided', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.payload');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/auth/me should return user data when a valid token is provided', async () => {
      const mockUser = {
        id: 'user-uuid-999',
        email: 'developer@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        role: UserRole.FREELANCER,
        passwordHash: 'secret_hash_value',
        isVerified: true,
        avatarUrl: null,
        phoneNumber: null,
        refreshToken: null,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        clientProfile: null,
        freelancerProfile: {
          id: 'fp-1',
          userId: 'user-uuid-999',
          title: 'Full Stack Dev',
          bio: 'Test bio',
          hourlyRate: null,
          experienceYears: 5,
          country: 'US',
          totalEarned: null,
          rating: null,
          reviewCount: 0,
          isAvailable: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          skills: [],
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.spyOn(UserRepository, 'findByIdWithProfile').mockResolvedValue(mockUser as any);

      const token = signAccessToken({
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });

      const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(mockUser.email);
      expect(res.body.data.user.role).toBe(UserRole.FREELANCER);
      // Ensure passwordHash is NEVER exposed
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });
  });
});
