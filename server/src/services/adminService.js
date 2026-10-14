import prisma from '../config/database.js';
import { ApiError } from '../utils/api-error.js';

export class AdminService {
  static async logAudit(adminId, action, entity, entityId, details, ipAddress = null) {
    try {
      const validAction = ['CREATE', 'UPDATE', 'STATUS_CHANGE'].includes(action) ? action : 'UPDATE';
      await prisma.auditLog.create({
        data: {
          userId: adminId,
          action: validAction,
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
      recentUsersRaw,
      recentProjectsRaw,
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
        _sum: { amount: true },
        where: { status: 'SUCCESS' }
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, firstName: true, lastName: true, email: true, role: true, isVerified: true, avatarUrl: true, createdAt: true }
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
          client: {
            select: {
              companyName: true,
              user: { select: { firstName: true, lastName: true, email: true } }
            }
          }
        }
      }),
      prisma.user.count({ where: { role: 'FREELANCER', isVerified: false } })
    ]);

    const recentUsers = recentUsersRaw.map(u => ({
      id: u.id,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
      email: u.email,
      role: u.role,
      status: u.isVerified ? 'VERIFIED' : 'ACTIVE',
      avatar: u.avatarUrl,
      createdAt: u.createdAt
    }));

    const recentProjects = recentProjectsRaw.map(p => ({
      id: p.id,
      title: p.title,
      budget: p.budget,
      status: p.status,
      createdAt: p.createdAt,
      client: {
        name: p.client?.companyName || (`${p.client?.user?.firstName || ''} ${p.client?.user?.lastName || ''}`.trim() || 'Client'),
        email: p.client?.user?.email || ''
      }
    }));

    // Monthly GMV / revenue for past 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const payments = await prisma.payment.findMany({
      where: {
        status: 'SUCCESS',
        createdAt: { gte: sixMonthsAgo }
      },
      select: { amount: true, createdAt: true }
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
        const amt = Number(p.amount);
        monthlyDataMap[key].gmv += amt;
        monthlyDataMap[key].revenue += amt * 0.1;
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

    const totalGMV = Number(paymentsSummary._sum.amount || 0);
    const platformRevenue = totalGMV * 0.1;

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
        totalGMV,
        platformRevenue
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
    if (status && status !== 'ALL') {
      if (status === 'VERIFIED') where.isVerified = true;
      if (status === 'UNVERIFIED') where.isVerified = false;
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [total, rawUsers] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          isVerified: true,
          avatarUrl: true,
          createdAt: true,
          freelancerProfile: { select: { id: true, title: true, rating: true } },
          clientProfile: { select: { id: true, companyName: true } }
        }
      })
    ]);

    const users = rawUsers.map(u => ({
      id: u.id,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.role,
      status: u.isVerified ? 'VERIFIED' : 'ACTIVE',
      isVerified: u.isVerified,
      avatar: u.avatarUrl,
      createdAt: u.createdAt,
      freelancerProfile: u.freelancerProfile,
      clientProfile: u.clientProfile
    }));

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

    const isVerified = status === 'VERIFIED' || status === true;
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isVerified }
    });

    await this.logAudit(adminId, 'STATUS_CHANGE', 'User', userId, {
      previousStatus: user.isVerified ? 'VERIFIED' : 'ACTIVE',
      newStatus: isVerified ? 'VERIFIED' : 'ACTIVE',
      reason
    });

    return {
      ...updated,
      name: `${updated.firstName || ''} ${updated.lastName || ''}`.trim(),
      status: updated.isVerified ? 'VERIFIED' : 'ACTIVE'
    };
  }

  static async getFreelancers(query = {}) {
    const { page = 1, limit = 15, search = '', isVerified } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {};
    if (isVerified !== undefined && isVerified !== 'ALL') {
      const boolVerified = isVerified === 'true' || isVerified === true;
      where.user = { isVerified: boolVerified };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [total, rawProfiles] = await Promise.all([
      prisma.freelancerProfile.count({ where }),
      prisma.freelancerProfile.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, isVerified: true, avatarUrl: true, createdAt: true } },
          skills: { include: { skill: true } }
        }
      })
    ]);

    const profiles = rawProfiles.map(p => ({
      ...p,
      isVerified: p.user?.isVerified || false,
      user: {
        ...p.user,
        name: `${p.user?.firstName || ''} ${p.user?.lastName || ''}`.trim() || p.user?.email,
        avatar: p.user?.avatarUrl,
        status: p.user?.isVerified ? 'VERIFIED' : 'ACTIVE'
      }
    }));

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
    let profile = await prisma.freelancerProfile.findUnique({
      where: { id: freelancerProfileId },
      include: { user: true }
    });

    let targetUserId = profile?.userId;
    if (!profile) {
      // Maybe user ID was passed
      const user = await prisma.user.findUnique({ where: { id: freelancerProfileId } });
      if (!user) throw ApiError.notFound('Freelancer profile or user not found');
      targetUserId = user.id;
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { isVerified: Boolean(isVerified) }
    });

    await this.logAudit(adminId, 'UPDATE', 'User', targetUserId, {
      isVerified: Boolean(isVerified),
      freelancerName: `${updatedUser.firstName || ''} ${updatedUser.lastName || ''}`.trim()
    });

    return {
      ...profile,
      isVerified: updatedUser.isVerified,
      user: updatedUser
    };
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

    const [total, rawProjects] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          client: {
            select: {
              id: true,
              companyName: true,
              user: { select: { firstName: true, lastName: true, email: true } }
            }
          },
          category: { select: { id: true, name: true } },
          _count: { select: { proposals: true, contracts: true } }
        }
      })
    ]);

    const projects = rawProjects.map(p => ({
      ...p,
      client: {
        id: p.client?.id,
        name: p.client?.companyName || (`${p.client?.user?.firstName || ''} ${p.client?.user?.lastName || ''}`.trim() || 'Client'),
        email: p.client?.user?.email || ''
      }
    }));

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

    await this.logAudit(adminId, 'STATUS_CHANGE', 'Project', projectId, {
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
        { project: { title: { contains: search, mode: 'insensitive' } } },
        { client: { user: { firstName: { contains: search, mode: 'insensitive' } } } },
        { client: { user: { lastName: { contains: search, mode: 'insensitive' } } } },
        { freelancerProfile: { user: { firstName: { contains: search, mode: 'insensitive' } } } },
        { freelancerProfile: { user: { lastName: { contains: search, mode: 'insensitive' } } } }
      ];
    }

    const [total, rawContracts] = await Promise.all([
      prisma.contract.count({ where }),
      prisma.contract.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          client: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true, email: true } }
            }
          },
          freelancerProfile: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true, email: true } }
            }
          },
          project: { select: { id: true, title: true } },
          milestones: { select: { id: true, status: true, amount: true } }
        }
      })
    ]);

    const contracts = rawContracts.map(c => ({
      ...c,
      title: c.project?.title || 'Contract',
      client: {
        id: c.client?.id,
        name: c.client?.companyName || (`${c.client?.user?.firstName || ''} ${c.client?.user?.lastName || ''}`.trim() || 'Client'),
        email: c.client?.user?.email || ''
      },
      freelancer: {
        id: c.freelancerProfile?.id,
        name: `${c.freelancerProfile?.user?.firstName || ''} ${c.freelancerProfile?.user?.lastName || ''}`.trim() || 'Freelancer',
        email: c.freelancerProfile?.user?.email || ''
      }
    }));

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

    const [total, rawDisputes] = await Promise.all([
      prisma.dispute.count({ where }),
      prisma.dispute.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          contract: {
            include: {
              client: {
                include: {
                  user: { select: { id: true, firstName: true, lastName: true, email: true } }
                }
              },
              freelancerProfile: {
                include: {
                  user: { select: { id: true, firstName: true, lastName: true, email: true } }
                }
              },
              project: { select: { id: true, title: true } }
            }
          },
          initiator: { select: { id: true, firstName: true, lastName: true, email: true } }
        }
      })
    ]);

    const disputes = rawDisputes.map(d => ({
      ...d,
      contract: {
        ...d.contract,
        title: d.contract?.project?.title || 'Contract',
        client: {
          id: d.contract?.client?.id,
          name: d.contract?.client?.companyName || (`${d.contract?.client?.user?.firstName || ''} ${d.contract?.client?.user?.lastName || ''}`.trim() || 'Client'),
          email: d.contract?.client?.user?.email || ''
        },
        freelancer: {
          id: d.contract?.freelancerProfile?.id,
          name: `${d.contract?.freelancerProfile?.user?.firstName || ''} ${d.contract?.freelancerProfile?.user?.lastName || ''}`.trim() || 'Freelancer',
          email: d.contract?.freelancerProfile?.user?.email || ''
        }
      },
      openedBy: {
        id: d.initiator?.id,
        name: `${d.initiator?.firstName || ''} ${d.initiator?.lastName || ''}`.trim() || d.initiator?.email,
        email: d.initiator?.email
      }
    }));

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
          adminDecision: resolution || awardedTo || 'RESOLVED',
          resolutionNotes: resolutionNotes || '',
          resolvedAt: new Date()
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

    await this.logAudit(adminId, 'UPDATE', 'Dispute', disputeId, {
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
    await this.logAudit(adminId, 'CREATE', 'Category', category.id, { name: category.name });
    return category;
  }

  static async updateCategory(id, data, adminId) {
    const category = await prisma.category.update({
      where: { id },
      data
    });
    await this.logAudit(adminId, 'UPDATE', 'Category', id, data);
    return category;
  }

  static async deleteCategory(id, adminId) {
    const deleted = await prisma.category.delete({ where: { id } });
    await this.logAudit(adminId, 'UPDATE', 'Category', id, { name: deleted.name });
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
    await this.logAudit(adminId, 'CREATE', 'Skill', skill.id, { name: skill.name });
    return skill;
  }

  static async deleteSkill(id, adminId) {
    const deleted = await prisma.skill.delete({ where: { id } });
    await this.logAudit(adminId, 'UPDATE', 'Skill', id, { name: deleted.name });
    return deleted;
  }

  static async getAuditLogs(query = {}) {
    const { page = 1, limit = 20, action, entity } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {};
    if (action && action !== 'ALL') where.action = action;
    if (entity && entity !== 'ALL') where.entity = entity;

    const [total, rawLogs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } }
        }
      })
    ]);

    const logs = rawLogs.map(l => ({
      ...l,
      user: l.user ? {
        ...l.user,
        name: `${l.user.firstName || ''} ${l.user.lastName || ''}`.trim() || l.user.email
      } : null
    }));

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
