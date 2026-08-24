import { prisma } from '../config/database.js';
import { User, UserRole, Prisma } from '@prisma/client';

export type UserWithProfile = Prisma.UserGetPayload<{
  include: {
    clientProfile: true;
    freelancerProfile: true;
  };
}>;

export class UserRepository {
  public static async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  public static async findByIdWithProfile(id: string): Promise<UserWithProfile | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        clientProfile: true,
        freelancerProfile: {
          include: {
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
      },
    });
  }

  public static async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  public static async findByResetToken(token: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });
  }

  public static async findByRefreshToken(token: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { refreshToken: token },
    });
  }

  public static async createUser(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    companyName?: string;
    title?: string;
  }): Promise<UserWithProfile> {
    const { email, passwordHash, firstName, lastName, role, companyName, title } = data;

    return prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        role,
        isVerified: true, // Defaulting true for prototype, email verification architecture in place
        ...(role === UserRole.CLIENT
          ? {
              clientProfile: {
                create: {
                  companyName: companyName || null,
                },
              },
            }
          : {
              freelancerProfile: {
                create: {
                  title: title || null,
                },
              },
            }),
      },
      include: {
        clientProfile: true,
        freelancerProfile: true,
      },
    });
  }

  public static async updateRefreshToken(userId: string, refreshToken: string | null): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }

  public static async updateResetToken(
    userId: string,
    resetPasswordToken: string | null,
    resetPasswordExpires: DateTime | null
  ): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: {
        resetPasswordToken,
        resetPasswordExpires,
      },
    });
  }

  public static async updatePassword(userId: string, passwordHash: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        refreshToken: null, // Revoke active sessions on password change
      },
    });
  }
}

type DateTime = Date;
