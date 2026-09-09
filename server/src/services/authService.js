import { prisma } from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.util.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.util.js';
import { ApiError } from '../utils/api-error.js';
import crypto from 'crypto';

export class AuthService {
  static async register(data) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw ApiError.conflict('An account with this email address already exists');
    }

    const passwordHash = await hashPassword(data.password);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        verificationToken,
        isVerified: false,
        clientProfile:
          data.role === 'CLIENT'
            ? {
                create: {
                  companyName: data.companyName || null,
                },
              }
            : undefined,
        freelancerProfile:
          data.role === 'FREELANCER'
            ? {
                create: {
                  title: data.title || null,
                },
              }
            : undefined,
      },
      include: {
        clientProfile: true,
        freelancerProfile: true,
      },
    });

    const tokenPayload = {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, accessToken, refreshToken };
  }

  static async login({ email, password }) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        clientProfile: true,
        freelancerProfile: true,
      },
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const tokenPayload = {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, accessToken, refreshToken };
  }

  static async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.unauthorized('Refresh token is required');
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id || payload.userId },
      include: {
        clientProfile: true,
        freelancerProfile: true,
      },
    });

    if (!user || user.refreshToken !== refreshToken) {
      throw ApiError.unauthorized('Invalid refresh session');
    }

    const tokenPayload = {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = signAccessToken(tokenPayload);
    const newRefreshToken = signRefreshToken(tokenPayload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  static async logout(userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { success: true };
  }

  static async getMe(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        clientProfile: true,
        freelancerProfile: {
          include: {
            skills: {
              include: { skill: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw ApiError.notFound('User account not found');
    }

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }
}
