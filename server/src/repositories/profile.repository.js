import { prisma } from '../config/database.js';

export class ProfileRepository {
  static async getUserFullProfile(userId) {
    return prisma.user.findUnique({
      where: { id: userId },
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

  static async updateUserProfile(userId, data) {
    const {
      firstName,
      lastName,
      phoneNumber,
      avatarUrl,
      location,
      companyName,
      companyWebsite,
      description,
      industry,
      title,
      bio,
      hourlyRate,
      experienceYears,
      experienceLevel,
      country,
      isAvailable,
    } = data;

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          ...(firstName !== undefined && { firstName }),
          ...(lastName !== undefined && { lastName }),
          ...(phoneNumber !== undefined && { phoneNumber }),
          ...(avatarUrl !== undefined && { avatarUrl }),
          ...(location !== undefined && { location }),
        },
      });

      if (user.role === 'CLIENT') {
        await tx.clientProfile.upsert({
          where: { userId },
          create: {
            userId,
            companyName,
            companyWebsite,
            description,
            industry,
          },
          update: {
            ...(companyName !== undefined && { companyName }),
            ...(companyWebsite !== undefined && { companyWebsite }),
            ...(description !== undefined && { description }),
            ...(industry !== undefined && { industry }),
          },
        });
      } else if (user.role === 'FREELANCER') {
        await tx.freelancerProfile.upsert({
          where: { userId },
          create: {
            userId,
            title,
            bio,
            hourlyRate,
            experienceYears,
            experienceLevel,
            country,
            isAvailable,
          },
          update: {
            ...(title !== undefined && { title }),
            ...(bio !== undefined && { bio }),
            ...(hourlyRate !== undefined && { hourlyRate }),
            ...(experienceYears !== undefined && { experienceYears }),
            ...(experienceLevel !== undefined && { experienceLevel }),
            ...(country !== undefined && { country }),
            ...(isAvailable !== undefined && { isAvailable }),
          },
        });
      }

      return user;
    });
  }
}

export default ProfileRepository;
