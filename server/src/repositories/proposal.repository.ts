import { prisma } from '../config/database.js';
import { ProposalStatus, ProjectStatus, Prisma } from '@prisma/client';
import { CreateProposalInput } from '../validators/proposal.validator.js';

export class ProposalRepository {
  public static async findExistingProposal(projectId: string, freelancerProfileId: string) {
    return prisma.proposal.findUnique({
      where: {
        projectId_freelancerProfileId: {
          projectId,
          freelancerProfileId,
        },
      },
    });
  }

  public static async createProposal(freelancerProfileId: string, data: CreateProposalInput) {
    const { projectId, coverLetter, bidAmount, estimatedDuration, milestonePricing, attachments } =
      data;

    return prisma.$transaction(async (tx) => {
      const proposal = await tx.proposal.create({
        data: {
          projectId,
          freelancerProfileId,
          coverLetter,
          bidAmount: new Prisma.Decimal(bidAmount),
          estimatedDuration,
          milestonePricing: milestonePricing
            ? (milestonePricing as unknown as Prisma.InputJsonValue)
            : Prisma.JsonNull,
          attachments: attachments
            ? (attachments as unknown as Prisma.InputJsonValue)
            : Prisma.JsonNull,
          status: ProposalStatus.PENDING,
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

      // Increment proposal count on project
      await tx.project.update({
        where: { id: projectId },
        data: {
          proposalCount: { increment: 1 },
        },
      });

      return proposal;
    });
  }

  public static async findProposalById(id: string) {
    return prisma.proposal.findUnique({
      where: { id },
      include: {
        project: {
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

  public static async getFreelancerProposals(
    freelancerProfileId: string,
    status?: ProposalStatus,
    page = 1,
    limit = 10
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.ProposalWhereInput = {
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

  public static async getProjectProposals(
    projectId: string,
    params: {
      status?: ProposalStatus;
      sortBy?: 'newest' | 'bid_low' | 'bid_high' | 'rating';
      page?: number;
      limit?: number;
    }
  ) {
    const { status, sortBy = 'newest', page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ProposalWhereInput = {
      projectId,
      ...(status ? { status } : {}),
    };

    let orderBy: Prisma.ProposalOrderByWithRelationInput = { createdAt: 'desc' };
    if (sortBy === 'bid_low') orderBy = { bidAmount: 'asc' };
    if (sortBy === 'bid_high') orderBy = { bidAmount: 'desc' };
    if (sortBy === 'rating') {
      orderBy = {
        freelancerProfile: {
          rating: 'desc',
        },
      };
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
              skills: {
                include: {
                  skill: true,
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

  public static async updateProposalStatus(id: string, status: ProposalStatus) {
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

  public static async acceptProposal(proposalId: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch proposal and related project with client & freelancer
      const proposal = await tx.proposal.findUnique({
        where: { id: proposalId },
        include: {
          project: {
            include: {
              milestones: {
                orderBy: { order: 'asc' },
              },
              client: true,
            },
          },
          freelancerProfile: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!proposal) {
        throw new Error('Proposal not found');
      }

      // Check for existing contract
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

      // 2. Mark this proposal as ACCEPTED
      const acceptedProposal = await tx.proposal.update({
        where: { id: proposalId },
        data: { status: ProposalStatus.ACCEPTED },
      });

      // 3. Reject all other pending/shortlisted proposals for this project
      await tx.proposal.updateMany({
        where: {
          projectId: proposal.projectId,
          id: { not: proposalId },
          status: { in: [ProposalStatus.PENDING, ProposalStatus.SHORTLISTED] },
        },
        data: { status: ProposalStatus.REJECTED },
      });

      // 4. Update Project status to IN_PROGRESS
      await tx.project.update({
        where: { id: proposal.projectId },
        data: { status: ProjectStatus.IN_PROGRESS },
      });

      // 5. Create Contract
      const contract = await tx.contract.create({
        data: {
          projectId: proposal.projectId,
          proposalId: proposal.id,
          clientId: proposal.project.clientId,
          freelancerProfileId: proposal.freelancerProfileId,
          totalAmount: proposal.bidAmount,
          status: 'ACTIVE',
          terms: `Standard freelance contract agreement between client and freelancer for "${proposal.project.title}". Deliverables and escrow released according to milestones schedule.`,
        },
      });

      // 6. Attach or create Milestones for Contract
      const proposalMilestones = (proposal.milestonePricing as any[]) || [];

      if (proposalMilestones.length > 0) {
        // Create milestones from proposal pricing
        await tx.milestone.createMany({
          data: proposalMilestones.map((m, idx) => ({
            contractId: contract.id,
            projectId: proposal.projectId,
            title: m.title || `Phase ${idx + 1}`,
            amount: new Prisma.Decimal(
              m.amount || Number(proposal.bidAmount) / proposalMilestones.length
            ),
            estimatedDuration: m.duration || '1 week',
            status: idx === 0 ? 'IN_PROGRESS' : 'PENDING',
            order: idx + 1,
          })),
        });
      } else if (proposal.project.milestones.length > 0) {
        // Associate existing project milestones with the new contract
        await tx.milestone.updateMany({
          where: { projectId: proposal.projectId },
          data: { contractId: contract.id },
        });
      } else {
        // Fallback default contract milestone
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

      // 7. Initialize 1-on-1 Conversation
      const conversation = await tx.conversation.create({
        data: {
          contractId: contract.id,
          projectId: proposal.projectId,
          participants: {
            create: [
              { userId: proposal.project.client.userId },
              { userId: proposal.freelancerProfile.userId },
            ],
          },
        },
      });

      // Welcome system message
      await tx.message.create({
        data: {
          conversationId: conversation.id,
          senderId: proposal.project.client.userId,
          content: `🎉 Proposal accepted! Welcome to the project "${proposal.project.title}". The contract is now active.`,
        },
      });

      return {
        proposal: acceptedProposal,
        contract,
      };
    });
  }
}
