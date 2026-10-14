import { prisma } from '../config/database.js';

export class ProposalRepository {
  static async findExistingProposal(projectId, freelancerProfileId) {
    return prisma.proposal.findUnique({
      where: {
        projectId_freelancerProfileId: {
          projectId,
          freelancerProfileId,
        },
      },
    });
  }

  static async createProposal(freelancerProfileId, data) {
    const { projectId, coverLetter, bidAmount, estimatedDuration, milestonePricing, attachments } = data;

    return prisma.$transaction(async (tx) => {
      const proposal = await tx.proposal.create({
        data: {
          projectId,
          freelancerProfileId,
          coverLetter,
          bidAmount: Number(bidAmount),
          estimatedDuration,
          milestonePricing: milestonePricing || [],
          attachments: attachments || [],
          status: 'PENDING',
        },
        include: {
          project: {
            select: {
              id: true,
              title: true,
              budget: true,
              budgetType: true,
              status: true,
            },
          },
          freelancerProfile: {
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

      await tx.project.update({
        where: { id: projectId },
        data: {
          proposalCount: { increment: 1 },
        },
      });

      return proposal;
    });
  }

  static async findProposalById(id) {
    return prisma.proposal.findUnique({
      where: { id },
      include: {
        project: {
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
                  },
                },
              },
            },
          },
        },
        freelancerProfile: {
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
            skills: { include: { skill: true } },
          },
        },
      },
    });
  }

  static async getFreelancerProposals(freelancerProfileId, status, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = {
      freelancerProfileId,
      ...(status ? { status } : {}),
    };

    const [total, proposals] = await Promise.all([
      prisma.proposal.count({ where }),
      prisma.proposal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          project: {
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
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      proposals,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getProjectProposals(projectId, params = {}) {
    const { status, sortBy = 'newest', page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const where = {
      projectId,
      ...(status ? { status } : {}),
    };

    let orderBy = { createdAt: 'desc' };
    if (sortBy === 'bid_low') orderBy = { bidAmount: 'asc' };
    if (sortBy === 'bid_high') orderBy = { bidAmount: 'desc' };
    if (sortBy === 'rating') {
      orderBy = { freelancerProfile: { rating: 'desc' } };
    }

    const [total, proposals] = await Promise.all([
      prisma.proposal.count({ where }),
      prisma.proposal.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          freelancerProfile: {
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
              skills: { include: { skill: true } },
            },
          },
        },
      }),
    ]);

    return {
      proposals,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async updateProposalStatus(id, status) {
    return prisma.proposal.update({
      where: { id },
      data: { status },
      include: {
        freelancerProfile: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  static async acceptProposal(proposalId) {
    return prisma.$transaction(async (tx) => {
      const proposal = await tx.proposal.findUnique({
        where: { id: proposalId },
        include: {
          project: {
            include: {
              milestones: { orderBy: { order: 'asc' } },
              client: true,
            },
          },
          freelancerProfile: {
            include: { user: true },
          },
        },
      });

      if (!proposal) throw new Error('Proposal not found');

      const existingContract = await tx.contract.findUnique({
        where: {
          projectId_freelancerProfileId: {
            projectId: proposal.projectId,
            freelancerProfileId: proposal.freelancerProfileId,
          },
        },
      });

      if (existingContract) {
        throw new Error('A contract already exists for this project and freelancer.');
      }

      const acceptedProposal = await tx.proposal.update({
        where: { id: proposalId },
        data: { status: 'ACCEPTED' },
      });

      await tx.proposal.updateMany({
        where: {
          projectId: proposal.projectId,
          id: { not: proposalId },
          status: { in: ['PENDING', 'SHORTLISTED'] },
        },
        data: { status: 'REJECTED' },
      });

      await tx.project.update({
        where: { id: proposal.projectId },
        data: { status: 'IN_PROGRESS' },
      });

      const contract = await tx.contract.create({
        data: {
          projectId: proposal.projectId,
          proposalId: proposal.id,
          clientId: proposal.project.clientId,
          freelancerProfileId: proposal.freelancerProfileId,
          totalAmount: proposal.bidAmount,
          status: 'ACTIVE',
          terms: `Standard freelance contract agreement between client and freelancer for "${proposal.project.title}".`,
        },
      });

      const proposalMilestones = Array.isArray(proposal.milestonePricing) ? proposal.milestonePricing : [];
      if (proposalMilestones.length > 0) {
        await tx.milestone.createMany({
          data: proposalMilestones.map((m, idx) => ({
            contractId: contract.id,
            projectId: proposal.projectId,
            title: m.title || `Phase ${idx + 1}`,
            amount: Number(m.amount || Number(proposal.bidAmount) / proposalMilestones.length),
            estimatedDuration: m.duration || '1 week',
            status: idx === 0 ? 'IN_PROGRESS' : 'PENDING',
            order: idx + 1,
          })),
        });
      } else if (proposal.project.milestones && proposal.project.milestones.length > 0) {
        await tx.milestone.updateMany({
          where: { projectId: proposal.projectId },
          data: { contractId: contract.id },
        });
      } else {
        await tx.milestone.create({
          data: {
            contractId: contract.id,
            projectId: proposal.projectId,
            title: 'Full Project Delivery',
            amount: proposal.bidAmount,
            estimatedDuration: proposal.estimatedDuration || '2 weeks',
            status: 'IN_PROGRESS',
            order: 1,
          },
        });
      }

      return {
        proposal: acceptedProposal,
        contract,
      };
    });
  }
}

export default ProposalRepository;
