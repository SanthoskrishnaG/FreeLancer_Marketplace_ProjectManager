import { UserRepository, UserWithProfile } from '../repositories/user.repository.js';
import { hashPassword, comparePassword } from '../utils/password.util.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  AuthJwtPayload,
} from '../utils/jwt.util.js';
import { generateRandomToken } from '../utils/token.util.js';
import { ApiError } from '../utils/api-error.js';
import {
  RegisterInput,
  LoginInput,
  ResetPasswordInput,
} from '../validators/auth.validator.js';
import { UserRole } from '@prisma/client';
import { logger } from '../utils/logger.js';

export interface SanitizedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isVerified: boolean;
  avatarUrl: string | null;
  phoneNumber: string | null;
  createdAt: Date;
  clientProfile?: unknown;
  freelancerProfile?: unknown;
}

export function sanitizeUser(user: UserWithProfile): SanitizedUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isVerified: user.isVerified,
    avatarUrl: user.avatarUrl,
    phoneNumber: user.phoneNumber,
    createdAt: user.createdAt,
    clientProfile: user.clientProfile || undefined,
    freelancerProfile: user.freelancerProfile || undefined,
  };
}

export class AuthService {
  public static async register(
    dto: RegisterInput
  ): Promise<{ user: SanitizedUser; accessToken: string; refreshToken: string }> {
    const existing = await UserRepository.findByEmail(dto.email);
    if (existing) {
      throw ApiError.badRequest('An account with this email address already exists');
    }

    const passwordHash = await hashPassword(dto.password);
    const user = await UserRepository.createUser({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role,
      companyName: dto.companyName,
      title: dto.title,
    });

    const jwtPayload: AuthJwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = signAccessToken(jwtPayload);
    const refreshToken = signRefreshToken(jwtPayload);

    await UserRepository.updateRefreshToken(user.id, refreshToken);

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  public static async login(
    dto: LoginInput
  ): Promise<{ user: SanitizedUser; accessToken: string; refreshToken: string }> {
    const user = await UserRepository.findByEmail(dto.email);
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isMatch = await comparePassword(dto.password, user.passwordHash);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const userWithProfile = await UserRepository.findByIdWithProfile(user.id);
    if (!userWithProfile) {
      throw ApiError.internal('User profile not found');
    }

    const jwtPayload: AuthJwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = signAccessToken(jwtPayload);
    const refreshToken = signRefreshToken(jwtPayload);

    await UserRepository.updateRefreshToken(user.id, refreshToken);

    return {
      user: sanitizeUser(userWithProfile),
      accessToken,
      refreshToken,
    };
  }

  public static async refresh(
    oldRefreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    if (!oldRefreshToken) {
      throw ApiError.unauthorized('Refresh token is required');
    }

    let payload: AuthJwtPayload;
    try {
      payload = verifyRefreshToken(oldRefreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const user = await UserRepository.findById(payload.userId);
    if (!user || user.refreshToken !== oldRefreshToken) {
      throw ApiError.unauthorized('Invalid or revoked refresh token');
    }

    const newPayload: AuthJwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);

    // Rotate refresh token
    await UserRepository.updateRefreshToken(user.id, newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  public static async logout(userId: string): Promise<void> {
    await UserRepository.updateRefreshToken(userId, null);
  }

  public static async getMe(userId: string): Promise<SanitizedUser> {
    const user = await UserRepository.findByIdWithProfile(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return sanitizeUser(user);
  }

  public static async forgotPassword(email: string): Promise<{ resetToken: string }> {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      // Return a simulated success to avoid email enumeration attacks
      return { resetToken: 'simulation' };
    }

    const resetToken = generateRandomToken(32);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await UserRepository.updateResetToken(user.id, resetToken, expiresAt);

    logger.info(`🔑 Password reset token generated for ${user.email}: ${resetToken}`);
    // In production, an email service would send an email with a link containing the resetToken

    return { resetToken };
  }

  public static async resetPassword(dto: ResetPasswordInput): Promise<void> {
    const user = await UserRepository.findByResetToken(dto.token);
    if (!user) {
      throw ApiError.badRequest('Invalid or expired password reset token');
    }

    const passwordHash = await hashPassword(dto.password);
    await UserRepository.updatePassword(user.id, passwordHash);
  }
}
