import { prisma } from '../config/database.js';

export class UserRepository {
  static async findById(id) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  static async findByIdWithProfile(id) {
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

  static async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  static async findByResetToken(token) {
    return prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });
  }

  static async findByRefreshToken(token) {
    return prisma.user.findFirst({
      where: { refreshToken: token },
    });
  }

  static async createUser(data) {
    return prisma.user.create({ data });
  }

  static async updateUser(id, data) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  static async deleteUser(id) {
    return prisma.user.delete({
      where: { id },
    });
  }
}

export default UserRepository;
