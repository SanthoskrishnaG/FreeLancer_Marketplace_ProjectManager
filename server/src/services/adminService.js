import prisma from '../config/database.js';
import { ApiError } from '../utils/api-error.js';

export class AdminService {
  static async logAudit(adminId, action, entity, entityId, details, ipAddress = null) {
    try {
      await prisma.auditLog.create({
        data: {
          userId: adminId,
          action,
          entity,
          entityId,
          details: typeof details === 'string' ? details : JSON.stringify(details),
          ipAddress
        }
      });
    } catch (err) {
      console.error('AuditLog error:', err);
    }
  }

  static async getDashboardOverview() {
    const [
      totalUsers,
      totalClients,
      totalFreelancers,
      totalProjects,
      activeProjects,
      totalContracts,
      activeContracts,
      totalProposals,
      openDisputes,
      paymentsSummary,
      recentUsers,
      recentProjects,
      unverifiedFreelancers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.user.count({ where: { role: 'FREELANCER' } }),
      prisma.project.count(),
      prisma.project.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.contract.count(),
      prisma.contract.count({ where: { status: 'ACTIVE' } }),
      prisma.proposal.count(),
      prisma.dispute.count({ where: { status: { in: ['OPEN', 'UNDER_REVIEW'] } } }),
      prisma.payment.aggregate({
        _sum: { amount: true, fee: true },
        where: { status: 'COMPLETED' }
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, status: true, createdAt: true }
      }),
      prisma.project.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          budget: true,
          status: true,
          createdAt: true,
          client: { select: { name: true, email: true } }
        }
      }),
      prisma.freelancerProfile.count({ where: { isVerified: false } })
    ]);

    // Monthly GMV / revenue for past 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const payments = await prisma.payment.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: sixMonthsAgo }
      },
      select: { amount: true, fee: true, createdAt: true }
    });

    const monthlyDataMap = {};
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const key = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyDataMap[key] = { month: key, gmv: 0, revenue: 0, transactions: 0 };
    }

    payments.forEach(p => {
      const key = new Date(p.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (monthlyDataMap[key]) {
        monthlyDataMap[key].gmv += Number(p.amount);
        monthlyDataMap[key].revenue += Number(p.fee || 0);
        monthlyDataMap[key].transactions += 1;
      }
    });

    // Project breakdown by status
    const projectsByStatus = await prisma.project.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    // Contract breakdown by status
    const contractsByStatus = await prisma.contract.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    return {
      stats: {
        totalUsers,
        totalClients,
        totalFreelancers,
        totalProjects,
        activeProjects,
        totalContracts,
        activeContracts,
        totalProposals,
        openDisputes,
        unverifiedFreelancers,
        totalGMV: Number(paymentsSummary._sum.amount || 0),
        platformRevenue: Number(paymentsSummary._sum.fee || (Number(paymentsSummary._sum.amount || 0) * 0.1))
      },
      charts: {
        financialTrends: Object.values(monthlyDataMap),
        projectsByStatus: projectsByStatus.map(p => ({ status: p.status, count: p._count.id })),
        contractsByStatus: contractsByStatus.map(c => ({ status: c.status, count: c._count.id }))
      },
      recentUsers,
      recentProjects
    };
  }

  static async getUsers(query = {}) {
    const { page = 1, limit = 15, search = '', role, status } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {};
    if (role && role !== 'ALL') where.role = role;
    if (status && status !== 'ALL') where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          avatar: true,
          createdAt: true,
          freelancerProfile: { select: { id: true, isVerified: true, title: true, rating: true } },
          _count: {
            select: {
              clientProjects: true,
              proposals: true,
              clientContracts: true,
              freelancerContracts: true
            }
          }
        }
      })
    ]);

    return {
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  }

  static async updateUserStatus(userId, status, reason, adminId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound('User not found');
    if (user.role === 'ADMIN') throw ApiError.badRequest('Cannot change status of an admin');

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { status }
    });

    await this.logAudit(adminId, 'UPDATE_USER_STATUS', 'User', userId, {
      previousStatus: user.status,
      newStatus: status,
      reason
    });

    return updated;
  }

  static async getFreelancers(query = {}) {
    const { page = 1, limit = 15, search = '', isVerified } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {};
    if (isVerified !== undefined && isVerified !== 'ALL') {
      where.isVerified = isVerified === 'true' || isVerified === true;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [total, profiles] = await Promise.all([
      prisma.freelancerProfile.count({ where }),
      prisma.freelancerProfile.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, status: true, avatar: true, createdAt: true } },
          skills: { include: { skill: true } }
        }
      })
    ]);

    return {
      profiles,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  }

  static async verifyFreelancer(freelancerProfileId, isVerified, adminId) {
    const profile = await prisma.freelancerProfile.findUnique({
      where: { id: freelancerProfileId },
      include: { user: true }
    });
    if (!profile) throw ApiError.notFound('Freelancer profile not found');

    const updated = await prisma.freelancerProfile.update({
      where: { id: freelancerProfileId },
      data: { isVerified: Boolean(isVerified) }
    });

    await this.logAudit(adminId, 'VERIFY_FREELANCER', 'FreelancerProfile', freelancerProfileId, {
      isVerified: Boolean(isVerified),
      freelancerName: profile.user?.name
    });

    return updated;
  }

  static async getProjects(query = {}) {
    const { page = 1, limit = 15, search = '', status, categoryId } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {};
    if (status && status !== 'ALL') where.status = status;
    if (categoryId && categoryId !== 'ALL') where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [total, projects] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { id: true, name: true, email: true } },
          category: { select: { id: true, name: true } },
          _count: { select: { proposals: true, contracts: true } }
        }
      })
    ]);

    return {
      projects,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  }

  static async updateProjectStatus(projectId, status, adminId) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw ApiError.notFound('Project not found');

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { status }
    });

    await this.logAudit(adminId, 'UPDATE_PROJECT_STATUS', 'Project', projectId, {
      oldStatus: project.status,
      newStatus: status
    });

    return updated;
  }

  static async getContracts(query = {}) {
    const { page = 1, limit = 15, search = '', status } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {};
    if (status && status !== 'ALL') where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { client: { name: { contains: search, mode: 'insensitive' } } },
        { freelancer: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [total, contracts] = await Promise.all([
      prisma.contract.count({ where }),
      prisma.contract.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { id: true, name: true, email: true } },
          freelancer: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, title: true } },
          milestones: { select: { id: true, status: true, amount: true } }
        }
      })
    ]);

    return {
      contracts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  }

  static async getDisputes(query = {}) {
    const { page = 1, limit = 15, status } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {};
    if (status && status !== 'ALL') where.status = status;

    const [total, disputes] = await Promise.all([
      prisma.dispute.count({ where }),
      prisma.dispute.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          contract: {
            include: {
              client: { select: { id: true, name: true, email: true } },
              freelancer: { select: { id: true, name: true, email: true } },
              project: { select: { id: true, title: true } }
            }
          },
          openedBy: { select: { id: true, name: true, email: true } }
        }
      })
    ]);

    return {
      disputes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  }

  static async resolveDispute(disputeId, { resolution, resolutionNotes, awardedTo }, adminId) {
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: { contract: true }
    });
    if (!dispute) throw ApiError.notFound('Dispute not found');

    const updated = await prisma.$transaction(async (tx) => {
      const resolved = await tx.dispute.update({
        where: { id: disputeId },
        data: {
          status: 'RESOLVED',
          resolution,
          resolutionNotes,
          awardedTo: awardedTo || null
        }
      });

      if (resolution === 'CANCEL_CONTRACT') {
        await tx.contract.update({
          where: { id: dispute.contractId },
          data: { status: 'CANCELLED' }
        });
      } else if (resolution === 'RELEASE_PAYMENT') {
        await tx.contract.update({
          where: { id: dispute.contractId },
          data: { status: 'COMPLETED' }
        });
      }

      return resolved;
    });

    await this.logAudit(adminId, 'RESOLVE_DISPUTE', 'Dispute', disputeId, {
      contractId: dispute.contractId,
      resolution,
      resolutionNotes,
      awardedTo
    });

    return updated;
  }

  static async getCategories() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { projects: true } } }
    });
  }

  static async createCategory(data, adminId) {
    const category = await prisma.category.create({ data });
    await this.logAudit(adminId, 'CREATE_CATEGORY', 'Category', category.id, { name: category.name });
    return category;
  }

  static async updateCategory(id, data, adminId) {
    const category = await prisma.category.update({
      where: { id },
      data
    });
    await this.logAudit(adminId, 'UPDATE_CATEGORY', 'Category', id, data);
    return category;
  }

  static async deleteCategory(id, adminId) {
    const deleted = await prisma.category.delete({ where: { id } });
    await this.logAudit(adminId, 'DELETE_CATEGORY', 'Category', id, { name: deleted.name });
    return deleted;
  }

  static async getSkills() {
    return prisma.skill.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { freelancers: true, projects: true } } }
    });
  }

  static async createSkill(data, adminId) {
    const skill = await prisma.skill.create({ data });
    await this.logAudit(adminId, 'CREATE_SKILL', 'Skill', skill.id, { name: skill.name });
    return skill;
  }

  static async deleteSkill(id, adminId) {
    const deleted = await prisma.skill.delete({ where: { id } });
    await this.logAudit(adminId, 'DELETE_SKILL', 'Skill', id, { name: deleted.name });
    return deleted;
  }

  static async getAuditLogs(query = {}) {
    const { page = 1, limit = 20, action, entity } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {};
    if (action && action !== 'ALL') where.action = action;
    if (entity && entity !== 'ALL') where.entity = entity;

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, role: true } }
        }
      })
    ]);

    return {
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  }

  static async getPlatformAnalytics() {
    const categoriesWithProjects = await prisma.category.findMany({
      include: {
        projects: {
          select: { budget: true, status: true }
        }
      }
    });

    const categoryDistribution = categoriesWithProjects.map(c => ({
      name: c.name,
      projectCount: c.projects.length,
      totalVolume: c.projects.reduce((acc, p) => acc + Number(p.budget), 0)
    }));

    const userRoles = await prisma.user.groupBy({
      by: ['role'],
      _count: { id: true }
    });

    const disputeStats = await prisma.dispute.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    return {
      categoryDistribution,
      userRoles: userRoles.map(u => ({ role: u.role, count: u._count.id })),
      disputeStats: disputeStats.map(d => ({ status: d.status, count: d._count.id }))
    };
  }
}
