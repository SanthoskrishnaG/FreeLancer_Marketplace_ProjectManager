import { prisma } from '../config/database.js';

export class ProjectRepository {
  static async createProject(clientId, data) {
    const {
      title,
      description,
      requirements,
      categoryId,
      skillIds = [],
      budgetType = 'FIXED',
      budget,
      minBudget,
      maxBudget,
      experienceLevel = 'INTERMEDIATE',
      deadline,
      status = 'PUBLISHED',
      attachments = [],
      milestones = [],
    } = data;

    return prisma.project.create({
      data: {
        clientId,
        title,
        description,
        requirements,
        categoryId: categoryId || null,
        budgetType,
        budget: Number(budget),
        minBudget: minBudget ? Number(minBudget) : null,
        maxBudget: maxBudget ? Number(maxBudget) : null,
        experienceLevel,
        deadline: deadline ? new Date(deadline) : null,
        status,
        attachments: attachments || [],
        skills: {
          create: skillIds.map((skillId) => ({ skillId })),
        },
        milestones: {
          create: milestones.map((m, idx) => ({
            title: m.title,
            description: m.description || '',
            amount: Number(m.amount),
            order: m.order || idx + 1,
            dueDate: m.dueDate ? new Date(m.dueDate) : null,
            deliverables: Array.isArray(m.deliverables) ? m.deliverables : (m.deliverables ? [m.deliverables] : []),
            acceptanceCriteria: Array.isArray(m.acceptanceCriteria) ? m.acceptanceCriteria : (m.acceptanceCriteria ? [m.acceptanceCriteria] : []),
            status: 'PENDING',
          })),
        },
      },
      include: {
        category: true,
        skills: { include: { skill: true } },
        milestones: true,
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

  static async getProjectById(projectId) {
    return prisma.project.findUnique({
      where: { id: projectId },
      include: {
        category: true,
        skills: { include: { skill: true } },
        milestones: { orderBy: { order: 'asc' } },
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
        freelancer: {
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
        _count: { select: { proposals: true } },
      },
    });
  }

  static async updateProject(projectId, data) {
    const { skillIds, ...updateFields } = data;

    if (skillIds) {
      await prisma.projectSkill.deleteMany({ where: { projectId } });
      await prisma.projectSkill.createMany({
        data: skillIds.map((skillId) => ({ projectId, skillId })),
      });
    }

    return prisma.project.update({
      where: { id: projectId },
      data: updateFields,
      include: {
        category: true,
        skills: { include: { skill: true } },
        milestones: true,
      },
    });
  }

  static async getClientProjects(clientId, status) {
    const where = { clientId };
    if (status) where.status = status;

    return prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        skills: { include: { skill: true } },
        milestones: { orderBy: { order: 'asc' } },
        _count: { select: { proposals: true } },
      },
    });
  }

  static async getPublicMarketplaceProjects(params = {}) {
    const page = parseInt(params.page || '1', 10);
    const limit = parseInt(params.limit || '10', 10);
    const skip = (page - 1) * limit;

    const where = {
      isIdea: false,
    };
    if (params.status) where.status = params.status;
    else where.status = { in: ['PUBLISHED', 'IN_PROGRESS'] };

    if (params.category) where.category = { slug: params.category };
    if (params.categoryId) where.categoryId = params.categoryId;
    if (params.experienceLevel) where.experienceLevel = params.experienceLevel;
    if (params.budgetType) where.budgetType = params.budgetType;

    if (params.minBudget !== undefined || params.maxBudget !== undefined) {
      where.budget = {
        gte: params.minBudget !== undefined ? Number(params.minBudget) : undefined,
        lte: params.maxBudget !== undefined ? Number(params.maxBudget) : undefined,
      };
    }

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    let orderBy = { createdAt: 'desc' };
    if (params.sortBy === 'budget_high') orderBy = { budget: 'desc' };
    if (params.sortBy === 'budget_low') orderBy = { budget: 'asc' };
    if (params.sortBy === 'deadline') orderBy = { deadline: 'asc' };

    const [total, projects] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: true,
          skills: { include: { skill: true } },
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
          _count: { select: { proposals: true, milestones: true } },
        },
      }),
    ]);

    return {
      projects,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async createProjectIdea(freelancerId, data) {
    const {
      title,
      summary,
      description,
      requirements,
      categoryId,
      skillIds = [],
      budget,
      minBudget,
      maxBudget,
      durationWeeks,
      durationUnit = 'weeks',
      startDate,
      targetEndDate,
      experienceLevel = 'INTERMEDIATE',
      referenceLinks = [],
      milestones = [],
    } = data;

    return prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          freelancerId,
          isIdea: true,
          status: 'DRAFT',
          title,
          summary: summary || null,
          description,
          requirements: requirements || null,
          categoryId: categoryId || null,
          budget: Number(budget),
          minBudget: minBudget ? Number(minBudget) : null,
          maxBudget: maxBudget ? Number(maxBudget) : null,
          budgetType: 'FIXED',
          durationWeeks: durationWeeks ? Number(durationWeeks) : null,
          durationUnit: durationUnit || 'weeks',
          startDate: startDate ? new Date(startDate) : null,
          targetEndDate: targetEndDate ? new Date(targetEndDate) : null,
          experienceLevel,
          referenceLinks: Array.isArray(referenceLinks) ? referenceLinks : [],
          skills: {
            create: skillIds.map((skillId) => ({ skillId })),
          },
          milestones: {
            create: milestones.map((m, idx) => ({
              title: m.title,
              description: m.description || '',
              amount: Number(m.amount),
              order: m.order || idx + 1,
              dueDate: m.dueDate ? new Date(m.dueDate) : null,
              deliverables: Array.isArray(m.deliverables) ? m.deliverables : (m.deliverables ? [m.deliverables] : []),
              estimatedDuration: m.estimatedDuration || null,
              acceptanceCriteria: Array.isArray(m.acceptanceCriteria) ? m.acceptanceCriteria : (m.acceptanceCriteria ? [m.acceptanceCriteria] : []),
              status: m.status || 'PENDING',
            })),
          },
        },
        include: {
          category: true,
          skills: { include: { skill: true } },
          milestones: { orderBy: { order: 'asc' } },
          freelancer: {
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

      return project;
    });
  }

  static async getFreelancerProjects(freelancerId) {
    return prisma.project.findMany({
      where: {
        freelancerId,
        isIdea: true,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        skills: { include: { skill: true } },
        milestones: { orderBy: { order: 'asc' } },
        _count: { select: { milestones: true } },
      },
    });
  }
}

export default ProjectRepository;
