import { prisma } from '../config/database.js';
import { ProjectStatus, ExperienceLevel, Prisma } from '@prisma/client';
import {
  CreateProjectInput,
  UpdateProjectInput,
  BatchMilestoneItem,
} from '../validators/project.validator.js';

export class ProjectRepository {
  public static async createProject(clientId: string, data: CreateProjectInput) {
    const {
      title,
      description,
      requirements,
      categoryId,
      skillIds,
      budgetType,
      budget,
      minBudget,
      maxBudget,
      experienceLevel,
      deadline,
      status,
      attachments,
    } = data;

    return prisma.project.create({
      data: {
        clientId,
        title,
        description,
        requirements,
        categoryId: categoryId || null,
        budgetType,
        budget: new Prisma.Decimal(budget),
        minBudget: minBudget ? new Prisma.Decimal(minBudget) : null,
        maxBudget: maxBudget ? new Prisma.Decimal(maxBudget) : null,
        experienceLevel,
        deadline: deadline ? new Date(deadline) : null,
        status: status || ProjectStatus.DRAFT,
        attachments: attachments
          ? (attachments as unknown as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        skills: {
          create: skillIds.map((skillId) => ({
            skillId,
          })),
        },
      },
      include: {
        category: true,
        skills: {
          include: {
            skill: true,
          },
        },
        client: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

  public static async updateProject(projectId: string, data: UpdateProjectInput) {
    const {
      title,
      description,
      requirements,
      categoryId,
      skillIds,
      budgetType,
      budget,
      minBudget,
      maxBudget,
      experienceLevel,
      deadline,
      status,
      attachments,
    } = data;

    // Handle skills update if provided
    if (skillIds) {
      await prisma.projectSkill.deleteMany({
        where: { projectId },
      });
      await prisma.projectSkill.createMany({
        data: skillIds.map((skillId) => ({
          projectId,
          skillId,
        })),
      });
    }

    const updateData: Prisma.ProjectUpdateInput = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (requirements !== undefined) updateData.requirements = requirements;
    if (categoryId !== undefined)
      updateData.category = categoryId ? { connect: { id: categoryId } } : { disconnect: true };
    if (budgetType !== undefined) updateData.budgetType = budgetType;
    if (budget !== undefined) updateData.budget = new Prisma.Decimal(budget);
    if (minBudget !== undefined)
      updateData.minBudget = minBudget ? new Prisma.Decimal(minBudget) : null;
    if (maxBudget !== undefined)
      updateData.maxBudget = maxBudget ? new Prisma.Decimal(maxBudget) : null;
    if (experienceLevel !== undefined) updateData.experienceLevel = experienceLevel;
    if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null;
    if (status !== undefined) updateData.status = status;
    if (attachments !== undefined)
      updateData.attachments = attachments as unknown as Prisma.InputJsonValue;

    return prisma.project.update({
      where: { id: projectId },
      data: updateData,
      include: {
        category: true,
        skills: {
          include: {
            skill: true,
          },
        },
        milestones: {
          orderBy: { order: 'asc' },
        },
        client: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

  public static async deleteProject(projectId: string) {
    return prisma.project.delete({
      where: { id: projectId },
    });
  }

  public static async getProjectById(projectId: string, currentUserId?: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        category: true,
        skills: {
          include: {
            skill: true,
          },
        },
        milestones: {
          orderBy: { order: 'asc' },
        },
        client: {
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
          },
        },
        _count: {
          select: {
            proposals: true,
          },
        },
        ...(currentUserId
          ? {
              bookmarks: {
                where: { userId: currentUserId },
              },
            }
          : {}),
      },
    });

    if (!project) return null;

    const isBookmarked = (project as any).bookmarks?.length > 0;
    return {
      ...project,
      isBookmarked,
    };
  }

  public static async getClientProjects(clientId: string, status?: ProjectStatus) {
    const where: Prisma.ProjectWhereInput = { clientId };
    if (status) {
      where.status = status;
    }

    return prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        skills: {
          include: {
            skill: true,
          },
        },
        milestones: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            proposals: true,
          },
        },
      },
    });
  }

  public static async getPublicMarketplaceProjects(params: {
    search?: string;
    category?: string;
    skill?: string;
    budgetType?: string;
    minBudget?: number;
    maxBudget?: number;
    experienceLevel?: ExperienceLevel;
    status?: ProjectStatus;
    sortBy: 'newest' | 'budget_high' | 'budget_low' | 'deadline';
    page: number;
    limit: number;
    currentUserId?: string;
  }) {
    const {
      search,
      category,
      skill,
      budgetType,
      minBudget,
      maxBudget,
      experienceLevel,
      status = ProjectStatus.PUBLISHED,
      sortBy,
      page,
      limit,
      currentUserId,
    } = params;

    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = {
      status,
    };

    if (budgetType) {
      where.budgetType = budgetType;
    }

    if (experienceLevel) {
      where.experienceLevel = experienceLevel;
    }

    if (minBudget !== undefined || maxBudget !== undefined) {
      where.budget = {};
      if (minBudget !== undefined) where.budget.gte = new Prisma.Decimal(minBudget);
      if (maxBudget !== undefined) where.budget.lte = new Prisma.Decimal(maxBudget);
    }

    if (category) {
      where.category = {
        slug: category,
      };
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
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Determine sorting
    let orderBy: Prisma.ProjectOrderByWithRelationInput = { createdAt: 'desc' };
    if (sortBy === 'budget_high') orderBy = { budget: 'desc' };
    if (sortBy === 'budget_low') orderBy = { budget: 'asc' };
    if (sortBy === 'deadline') orderBy = { deadline: 'asc' };

    const [total, projects] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: true,
          skills: {
            include: {
              skill: true,
            },
          },
          client: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                  location: true,
                },
              },
            },
          },
          _count: {
            select: {
              proposals: true,
              milestones: true,
            },
          },
          ...(currentUserId
            ? {
                bookmarks: {
                  where: { userId: currentUserId },
                },
              }
            : {}),
        },
      }),
    ]);

    const formattedProjects = projects.map((p) => ({
      ...p,
      isBookmarked: (p as any).bookmarks ? (p as any).bookmarks.length > 0 : false,
    }));

    return {
      projects: formattedProjects,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public static async toggleBookmark(userId: string, projectId: string) {
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: { id: existing.id },
      });
      return { isBookmarked: false };
    } else {
      await prisma.bookmark.create({
        data: {
          userId,
          projectId,
        },
      });
      return { isBookmarked: true };
    }
  }

  public static async getUserBookmarks(userId: string) {
    return prisma.bookmark.findMany({
      where: { userId },
      include: {
        project: {
          include: {
            category: true,
            skills: {
              include: {
                skill: true,
              },
            },
            client: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
            _count: {
              select: { proposals: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public static async saveProjectMilestones(projectId: string, milestones: BatchMilestoneItem[]) {
    // Delete existing milestones for this project and replace with approved batch
    await prisma.milestone.deleteMany({
      where: { projectId },
    });

    return prisma.milestone.createMany({
      data: milestones.map((m, idx) => ({
        projectId,
        title: m.title,
        description: m.description || null,
        deliverables: m.deliverables || [],
        estimatedDuration: m.estimatedDuration,
        budgetPercentage: new Prisma.Decimal(m.budgetPercentage),
        amount: new Prisma.Decimal(m.amount),
        dependencies: m.dependencies || [],
        acceptanceCriteria: m.acceptanceCriteria || [],
        order: m.order !== undefined ? m.order : idx,
      })),
    });
  }
}
