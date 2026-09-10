import { prisma } from '../config/database.js';
import { User, ExperienceLevel, Prisma } from '@prisma/client';
import { UpdateProfileInput } from '../validators/profile.validator.js';

export class ProfileRepository {
  public static async getUserFullProfile(userId: string) {
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

  public static async updateUserProfile(userId: string, data: UpdateProfileInput): Promise<User> {
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
      logoUrl,
      title,
      bio,
      hourlyRate,
      experienceYears,
      experienceLevel,
      isAvailable,
      languages,
      portfolio,
    } = data;

    // Fetch user to know role
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    // Prepare update payload for User table
    const userUpdate: Prisma.UserUpdateInput = {};
    if (firstName !== undefined) userUpdate.firstName = firstName;
    if (lastName !== undefined) userUpdate.lastName = lastName;
    if (phoneNumber !== undefined) userUpdate.phoneNumber = phoneNumber;
    if (avatarUrl !== undefined) userUpdate.avatarUrl = avatarUrl;
    if (location !== undefined) userUpdate.location = location;

    // Update ClientProfile if client
    if (user.role === 'CLIENT') {
      const clientUpdate: Prisma.ClientProfileUpdateInput = {};
      if (companyName !== undefined) clientUpdate.companyName = companyName;
      if (companyWebsite !== undefined) clientUpdate.companyWebsite = companyWebsite;
      if (description !== undefined) clientUpdate.description = description;
      if (industry !== undefined) clientUpdate.industry = industry;
      if (logoUrl !== undefined) clientUpdate.logoUrl = logoUrl;
      if (location !== undefined) clientUpdate.country = location;

      userUpdate.clientProfile = {
        upsert: {
          create: {
            companyName,
            companyWebsite,
            description,
            industry,
            logoUrl,
            country: location,
          },
          update: clientUpdate,
        },
      };
    }

    // Update FreelancerProfile if freelancer
    if (user.role === 'FREELANCER') {
      const freelancerUpdate: Prisma.FreelancerProfileUpdateInput = {};
      if (title !== undefined) freelancerUpdate.title = title;
      if (bio !== undefined) freelancerUpdate.bio = bio;
      if (hourlyRate !== undefined)
        freelancerUpdate.hourlyRate = hourlyRate ? new Prisma.Decimal(hourlyRate) : null;
      if (experienceYears !== undefined) freelancerUpdate.experienceYears = experienceYears;
      if (experienceLevel !== undefined) freelancerUpdate.experienceLevel = experienceLevel;
      if (isAvailable !== undefined) freelancerUpdate.isAvailable = isAvailable;
      if (languages !== undefined) freelancerUpdate.languages = languages;
      if (portfolio !== undefined)
        freelancerUpdate.portfolio = portfolio as unknown as Prisma.InputJsonValue;
      if (location !== undefined) freelancerUpdate.country = location;

      userUpdate.freelancerProfile = {
        upsert: {
          create: {
            title,
            bio,
            hourlyRate: hourlyRate ? new Prisma.Decimal(hourlyRate) : null,
            experienceYears: experienceYears || 0,
            experienceLevel: experienceLevel || ExperienceLevel.INTERMEDIATE,
            isAvailable: isAvailable !== undefined ? isAvailable : true,
            languages: languages || ['English'],
            portfolio: portfolio as unknown as Prisma.InputJsonValue,
            country: location,
          },
          update: freelancerUpdate,
        },
      };
    }

    return prisma.user.update({
      where: { id: userId },
      data: userUpdate,
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

  public static async getFreelancers(params: {
    search?: string;
    skill?: string;
    experienceLevel?: ExperienceLevel;
    minRate?: number;
    maxRate?: number;
    availableOnly?: boolean;
    page: number;
    limit: number;
  }) {
    const { search, skill, experienceLevel, minRate, maxRate, availableOnly, page, limit } = params;

    const skip = (page - 1) * limit;

    const where: Prisma.FreelancerProfileWhereInput = {};

    if (availableOnly) {
      where.isAvailable = true;
    }

    if (experienceLevel) {
      where.experienceLevel = experienceLevel;
    }

    if (minRate !== undefined || maxRate !== undefined) {
      where.hourlyRate = {};
      if (minRate !== undefined) where.hourlyRate.gte = new Prisma.Decimal(minRate);
      if (maxRate !== undefined) where.hourlyRate.lte = new Prisma.Decimal(maxRate);
    }

    if (skill) {
      where.skills = {
        some: {
          skill: {
            name: { contains: skill, mode: 'insensitive' },
          },
        },
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    const [total, freelancers] = await Promise.all([
      prisma.freelancerProfile.count({ where }),
      prisma.freelancerProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ rating: 'desc' }, { totalEarned: 'desc' }],
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              location: true,
              createdAt: true,
            },
          },
          skills: {
            include: {
              skill: true,
            },
          },
        },
      }),
    ]);

    return {
      freelancers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public static async getFreelancerById(id: string) {
    return prisma.freelancerProfile.findFirst({
      where: {
        OR: [{ id }, { userId: id }],
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            location: true,
            createdAt: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
        contracts: {
          where: { status: 'COMPLETED' },
          select: {
            id: true,
            totalAmount: true,
            endDate: true,
            reviews: true,
          },
          take: 5,
        },
      },
    });
  }

  public static async addSkillToFreelancer(userId: string, skillId: string, proficiency: string) {
    const profile = await prisma.freelancerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new Error('Freelancer profile not found');
    }

    return prisma.freelancerSkill.upsert({
      where: {
        freelancerProfileId_skillId: {
          freelancerProfileId: profile.id,
          skillId,
        },
      },
      create: {
        freelancerProfileId: profile.id,
        skillId,
        proficiency,
      },
      update: {
        proficiency,
      },
      include: {
        skill: true,
      },
    });
  }

  public static async removeSkillFromFreelancer(userId: string, skillId: string) {
    const profile = await prisma.freelancerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new Error('Freelancer profile not found');
    }

    return prisma.freelancerSkill.deleteMany({
      where: {
        freelancerProfileId: profile.id,
        skillId,
      },
    });
  }

  public static async getAllSkills() {
    return prisma.skill.findMany({
      orderBy: { name: 'asc' },
    });
  }

  public static async getAllCategories() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { projects: true },
        },
      },
    });
  }
}
