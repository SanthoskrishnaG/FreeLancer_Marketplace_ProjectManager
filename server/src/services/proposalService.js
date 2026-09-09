import { prisma } from '../config/database.js';
import { ApiError } from '../utils/api-error.js';

export class ProposalService {
  static async submitProposal(userId, data) {
    const freelancerProfile = await prisma.freelancerProfile.findUnique({
      where: { userId },
    });

    if (!freelancerProfile) {
      throw ApiError.forbidden('Only registered freelancers can submit proposals');
    }

    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
      include: { client: true },
    });

    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    // Prevent self-application
    if (project.client.userId === userId) {
      throw ApiError.badRequest('You cannot submit a proposal to your own project');
    }

    if (project.status !== 'PUBLISHED') {
      throw ApiError.badRequest('Proposals can only be submitted to published projects');
    }

    // Prevent duplicate proposals
    const existing = await prisma.proposal.findUnique({
      where: {
        projectId_freelancerProfileId: {
          projectId: data.projectId,
          freelancerProfileId: freelancerProfile.id,
        },
      },
    });

    if (existing) {
      throw ApiError.conflict('You have already submitted a proposal for this project');
    }

    return prisma.$transaction(async (tx) => {
      const proposal = await tx.proposal.create({
        data: {
          projectId: data.projectId,
          freelancerProfileId: freelancerProfile.id,
          coverLetter: data.coverLetter,
          bidAmount: data.bidAmount,
          estimatedDuration: data.estimatedDuration,
          milestonePricing: data.milestonePricing || [],
          attachments: data.attachments || [],
          status: 'PENDING',
        },
      });

      await tx.project.update({
        where: { id: data.projectId },
        data: { proposalCount: { increment: 1 } },
      });

      // Notify client
      await tx.notification.create({
        data: {
          userId: project.client.userId,
          title: 'New Proposal Received',
          message: `A new proposal of $${data.bidAmount} was submitted for "${project.title}".`,
          type: 'PROPOSAL',
          link: `/client/projects/${project.id}/proposals`,
        },
      });

      return proposal;
    });
  }

  static async getProjectProposals(userId, projectId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { client: true },
    });

    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    if (project.client.userId !== userId) {
      throw ApiError.forbidden('Only the project owner can view submitted proposals');
    }

    return prisma.proposal.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: {
        freelancerProfile: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, location: true } },
            skills: { include: { skill: true } },
          },
        },
      },
    });
  }

  static async getFreelancerProposals(userId) {
    const freelancerProfile = await prisma.freelancerProfile.findUnique({
      where: { userId },
    });

    if (!freelancerProfile) {
      throw ApiError.forbidden('Freelancer profile not found');
    }

    return prisma.proposal.findMany({
      where: { freelancerProfileId: freelancerProfile.id },
      orderBy: { createdAt: 'desc' },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            budget: true,
            status: true,
            client: {
              select: {
                companyName: true,
                user: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
      },
    });
  }

  static async shortlistProposal(userId, proposalId) {
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: { project: { include: { client: true } } },
    });

    if (!proposal || proposal.project.client.userId !== userId) {
      throw ApiError.forbidden('Unauthorized to update this proposal');
    }

    return prisma.proposal.update({
      where: { id: proposalId },
      data: { status: 'SHORTLISTED' },
    });
  }

  static async acceptProposal(userId, proposalId) {
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        project: {
          include: {
            client: true,
            milestones: { orderBy: { order: 'asc' } },
          },
        },
        freelancerProfile: true,
      },
    });

    if (!proposal) {
      throw ApiError.notFound('Proposal not found');
    }

    if (proposal.project.client.userId !== userId) {
      throw ApiError.forbidden('Only the client who owns this project can accept proposals');
    }

    // Atomic hiring workflow:
    // 1. Accept this proposal
    // 2. Reject other proposals
    // 3. Create contract
    // 4. Update milestones to belong to contract and IN_PROGRESS
    // 5. Update project status to IN_PROGRESS
    // 6. Notify freelancer
    return prisma.$transaction(async (tx) => {
      // 1. Accept chosen proposal
      const accepted = await tx.proposal.update({
        where: { id: proposalId },
        data: { status: 'ACCEPTED' },
      });

      // 2. Reject other pending proposals for this project
      await tx.proposal.updateMany({
        where: {
          projectId: proposal.projectId,
          id: { not: proposalId },
          status: { in: ['PENDING', 'SHORTLISTED'] },
        },
        data: { status: 'REJECTED' },
      });

      // 3. Create Contract
      const contract = await tx.contract.create({
        data: {
          projectId: proposal.projectId,
          proposalId: proposal.id,
          clientId: proposal.project.clientId,
          freelancerProfileId: proposal.freelancerProfileId,
          status: 'ACTIVE',
          totalAmount: proposal.bidAmount,
          startDate: new Date(),
          terms: 'Standard intellectual property transfer upon milestone release.',
        },
      });

      // 4. Associate milestones to contract and start first milestone
      const milestones = proposal.project.milestones;
      for (let i = 0; i < milestones.length; i++) {
        const m = milestones[i];
        await tx.milestone.update({
          where: { id: m.id },
          data: {
            contractId: contract.id,
            status: i === 0 ? 'IN_PROGRESS' : 'PENDING',
          },
        });
      }

      // 5. Update project status
      await tx.project.update({
        where: { id: proposal.projectId },
        data: { status: 'IN_PROGRESS' },
      });

      // 6. Create invoice in ISSUED status for the contract
      await tx.invoice.create({
        data: {
          invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
          clientId: proposal.project.clientId,
          freelancerProfileId: proposal.freelancerProfileId,
          projectId: proposal.projectId,
          contractId: contract.id,
          subtotal: proposal.bidAmount,
          tax: 0,
          total: proposal.bidAmount,
          status: 'ISSUED',
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        },
      });

      // 7. Notify Freelancer
      await tx.notification.create({
        data: {
          userId: proposal.freelancerProfile.userId,
          title: 'Proposal Accepted! You are Hired',
          message: `Congratulations! Your proposal for "${proposal.project.title}" has been accepted. A contract has been created.`,
          type: 'CONTRACT',
          link: `/freelancer/contracts/${contract.id}`,
        },
      });

      return {
        proposal: accepted,
        contract,
      };
    });
  }
}
