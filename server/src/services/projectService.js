import { prisma } from '../config/database.js';
import { ApiError } from '../utils/api-error.js';

export class ProjectService {
  static async createProject(userId, data) {
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId },
    });

    if (!clientProfile) {
      throw ApiError.forbidden('Only registered clients can create projects');
    }

    const { milestones = [], skillIds = [], ...projectFields } = data;

    return prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          ...projectFields,
          clientId: clientProfile.id,
          status: 'PUBLISHED',
          skills: {
            create: skillIds.map((skillId) => ({ skillId })),
          },
          milestones: {
            create: milestones.map((m, idx) => ({
              title: m.title,
              description: m.description,
              amount: m.amount,
              order: m.order || idx + 1,
              dueDate: m.dueDate ? new Date(m.dueDate) : null,
              deliverables: m.deliverables || [],
              acceptanceCriteria: m.acceptanceCriteria || [],
              status: 'PENDING',
            })),
          },
        },
        include: {
          milestones: true,
          skills: { include: { skill: true } },
          category: true,
        },
      });

      return project;
    });
  }

  static async getProjects(query = {}) {
    const page = Math.max(parseInt(query.page || '1', 10), 1);
    const limit = Math.max(parseInt(query.limit || '12', 10), 1);
    const skip = (page - 1) * limit;

    const where = {};

    if (query.status) {
      where.status = query.status;
    } else {
      where.status = { in: ['PUBLISHED', 'IN_PROGRESS'] };
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.experienceLevel) {
      where.experienceLevel = query.experienceLevel;
    }

    if (query.minBudget || query.maxBudget) {
      where.budget = {
        gte: query.minBudget ? Number(query.minBudget) : undefined,
        lte: query.maxBudget ? Number(query.maxBudget) : undefined,
      };
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    let orderBy = { createdAt: 'desc' };
    if (query.sortBy === 'budget_asc') orderBy = { budget: 'asc' };
    if (query.sortBy === 'budget_desc') orderBy = { budget: 'desc' };
    if (query.sortBy === 'deadline') orderBy = { deadline: 'asc' };

    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          client: {
            include: {
              user: { select: { firstName: true, lastName: true, avatarUrl: true, location: true } },
            },
          },
          category: true,
          skills: { include: { skill: true } },
          _count: { select: { proposals: true, milestones: true } },
        },
      }),
      prisma.project.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getProjectById(id) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true, location: true, createdAt: true },
            },
          },
        },
        category: true,
        skills: { include: { skill: true } },
        milestones: { orderBy: { order: 'asc' } },
        _count: { select: { proposals: true } },
      },
    });

    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    return project;
  }

  static async getClientProjects(userId) {
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId },
    });

    if (!clientProfile) {
      throw ApiError.forbidden('Client profile not found');
    }

    return prisma.project.findMany({
      where: { clientId: clientProfile.id },
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        milestones: { orderBy: { order: 'asc' } },
        _count: { select: { proposals: true, contracts: true } },
      },
    });
  }
}
