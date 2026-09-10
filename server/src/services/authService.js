import { prisma } from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.util.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.util.js';
import { ApiError } from '../utils/api-error.js';
import crypto from 'crypto';

export class AuthService {
  static async register(data) {
    const normalizedEmail = (data.email || '').trim().toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw ApiError.conflict('An account with this email already exists.');
    }

    const passwordHash = await hashPassword(data.password);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const nameParts = (data.name || '').trim().split(/\s+/);
    const resolvedFirstName = data.firstName || nameParts[0] || 'User';
    const resolvedLastName = data.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Member');

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        firstName: resolvedFirstName,
        lastName: resolvedLastName,
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
    const normalizedEmail = (email || '').trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
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

  static async getProfile(userId) {
    return this.getMe(userId);
  }

  static async updateProfile(userId, data) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { clientProfile: true, freelancerProfile: true },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const userUpdate = {};
    if (data.firstName) userUpdate.firstName = data.firstName;
    if (data.lastName) userUpdate.lastName = data.lastName;
    if (data.phoneNumber !== undefined) userUpdate.phoneNumber = data.phoneNumber;
    if (data.location !== undefined) userUpdate.location = data.location;
    if (data.avatarUrl !== undefined) userUpdate.avatarUrl = data.avatarUrl;

    if (Object.keys(userUpdate).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: userUpdate,
      });
    }

    if (user.role === 'CLIENT' && user.clientProfile) {
      const clientUpdate = {};
      if (data.companyName !== undefined) clientUpdate.companyName = data.companyName;
      if (data.companyWebsite !== undefined) clientUpdate.companyWebsite = data.companyWebsite;
      if (data.description !== undefined) clientUpdate.description = data.description;
      if (data.industry !== undefined) clientUpdate.industry = data.industry;
      if (data.country !== undefined) clientUpdate.country = data.country;

      if (Object.keys(clientUpdate).length > 0) {
        await prisma.clientProfile.update({
          where: { userId },
          data: clientUpdate,
        });
      }
    }

    if (user.role === 'FREELANCER' && user.freelancerProfile) {
      const freelancerUpdate = {};
      if (data.title !== undefined) freelancerUpdate.title = data.title;
      if (data.bio !== undefined) freelancerUpdate.bio = data.bio;
      if (data.hourlyRate !== undefined) freelancerUpdate.hourlyRate = Number(data.hourlyRate);
      if (data.experienceYears !== undefined) freelancerUpdate.experienceYears = Number(data.experienceYears);
      if (data.experienceLevel !== undefined) freelancerUpdate.experienceLevel = data.experienceLevel;
      if (data.country !== undefined) freelancerUpdate.country = data.country;
      if (data.isAvailable !== undefined) freelancerUpdate.isAvailable = Boolean(data.isAvailable);

      if (Object.keys(freelancerUpdate).length > 0) {
        await prisma.freelancerProfile.update({
          where: { userId },
          data: freelancerUpdate,
        });
      }
    }

    return this.getMe(userId);
  }

  static async getFreelancers(query = {}) {
    const { page = 1, limit = 12, search = '', experienceLevel, category } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {};
    if (experienceLevel && experienceLevel !== 'ALL') {
      where.experienceLevel = experienceLevel;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.freelancerProfile.count({ where }),
      prisma.freelancerProfile.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { rating: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
              location: true,
              isVerified: true,
            },
          },
          skills: {
            include: { skill: true },
          },
        },
      }),
    ]);

    return {
      freelancers: items,
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  static async getFreelancerById(id) {
    const profile = await prisma.freelancerProfile.findFirst({
      where: {
        OR: [{ id }, { userId: id }],
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
            location: true,
            isVerified: true,
            createdAt: true,
          },
        },
        skills: {
          include: { skill: true },
        },
      },
    });

    if (!profile) {
      throw ApiError.notFound('Freelancer profile not found');
    }

    return profile;
  }
}
