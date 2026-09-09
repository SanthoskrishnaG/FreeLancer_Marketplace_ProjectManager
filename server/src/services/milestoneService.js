import { prisma } from '../config/database.js';
import { ApiError } from '../utils/api-error.js';

export class MilestoneService {
  static async getMilestoneById(milestoneId, userId) {
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        submissions: { orderBy: { submittedAt: 'desc' } },
        revisions: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!milestone) throw ApiError.notFound('Milestone not found');
    return milestone;
  }

  static async getContractMilestones(contractId, userId) {
    return prisma.milestone.findMany({
      where: { contractId },
      include: {
        submissions: { orderBy: { submittedAt: 'desc' } },
        revisions: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { order: 'asc' },
    });
  }

  static async startMilestone(userId, milestoneId) {
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
    });
    if (!milestone) throw ApiError.notFound('Milestone not found');

    const updated = await prisma.milestone.update({
      where: { id: milestoneId },
      data: { status: 'IN_PROGRESS' },
    });
    return updated;
  }
  static async submitMilestone(userId, milestoneId, data) {
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        contract: {
          include: {
            freelancerProfile: true,
            client: true,
            project: true,
          },
        },
      },
    });

    if (!milestone || !milestone.contract) {
      throw ApiError.notFound('Milestone or assigned contract not found');
    }

    if (milestone.contract.freelancerProfile.userId !== userId) {
      throw ApiError.forbidden('Only the assigned freelancer can submit work for this milestone');
    }

    return prisma.$transaction(async (tx) => {
      // 1. Create a submission record (never overwrite old submissions)
      const submission = await tx.milestoneSubmission.create({
        data: {
          milestoneId,
          freelancerProfileId: milestone.contract.freelancerProfileId,
          description: data.description,
          notes: data.notes || null,
          links: data.links || [],
          submittedAt: new Date(),
        },
      });

      // 2. Update milestone status to SUBMITTED
      const updatedMilestone = await tx.milestone.update({
        where: { id: milestoneId },
        data: { status: 'SUBMITTED' },
      });

      // 3. Notify Client
      await tx.notification.create({
        data: {
          userId: milestone.contract.client.userId,
          title: 'Milestone Work Submitted',
          message: `Freelancer submitted work for milestone "${milestone.title}". Please review deliverables.`,
          type: 'MILESTONE',
          link: `/client/contracts/${milestone.contractId}`,
        },
      });

      return {
        milestone: updatedMilestone,
        submission,
      };
    });
  }

  /**
   * Client requests revision on a submitted milestone
   */
  static async requestRevision(userId, milestoneId, data) {
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        contract: {
          include: {
            client: true,
            freelancerProfile: true,
          },
        },
        submissions: {
          orderBy: { submittedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!milestone || !milestone.contract) {
      throw ApiError.notFound('Milestone not found');
    }

    if (milestone.contract.client.userId !== userId) {
      throw ApiError.forbidden('Only the client can request revisions');
    }

    return prisma.$transaction(async (tx) => {
      const latestSubmission = milestone.submissions[0];

      const revision = await tx.revision.create({
        data: {
          milestoneId,
          submissionId: latestSubmission?.id || null,
          feedback: data.feedback,
          requestedChanges: data.requestedChanges || [],
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
        },
      });

      const updatedMilestone = await tx.milestone.update({
        where: { id: milestoneId },
        data: { status: 'REVISION_REQUESTED' },
      });

      // Notify freelancer
      await tx.notification.create({
        data: {
          userId: milestone.contract.freelancerProfile.userId,
          title: 'Milestone Revision Requested',
          message: `Client requested changes for "${milestone.title}". See feedback and update your work.`,
          type: 'MILESTONE',
          link: `/freelancer/contracts/${milestone.contractId}`,
        },
      });

      return {
        milestone: updatedMilestone,
        revision,
      };
    });
  }

  /**
   * Client approves milestone.
   * If all milestones in contract are approved/completed, marks contract and project COMPLETED.
   */
  static async approveMilestone(userId, milestoneId) {
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        contract: {
          include: {
            client: true,
            freelancerProfile: true,
            project: true,
            milestones: { orderBy: { order: 'asc' } },
          },
        },
      },
    });

    if (!milestone || !milestone.contract) {
      throw ApiError.notFound('Milestone not found');
    }

    if (milestone.contract.client.userId !== userId) {
      throw ApiError.forbidden('Only the client can approve milestone deliverables');
    }

    return prisma.$transaction(async (tx) => {
      // 1. Mark this milestone as APPROVED and COMPLETED
      const approvedMilestone = await tx.milestone.update({
        where: { id: milestoneId },
        data: { status: 'COMPLETED' },
      });

      // 2. Check if there is a next pending milestone to activate
      const allMilestones = milestone.contract.milestones;
      const currentIndex = allMilestones.findIndex((m) => m.id === milestoneId);
      const nextMilestone = allMilestones[currentIndex + 1];

      if (nextMilestone && nextMilestone.status === 'PENDING') {
        await tx.milestone.update({
          where: { id: nextMilestone.id },
          data: { status: 'IN_PROGRESS' },
        });
      }

      // 3. Check if all contract milestones are now COMPLETED
      const remainingUnfinished = await tx.milestone.count({
        where: {
          contractId: milestone.contractId,
          status: { not: 'COMPLETED' },
        },
      });

      const allCompleted = remainingUnfinished === 0;
      if (allCompleted) {
        await tx.contract.update({
          where: { id: milestone.contractId },
          data: {
            status: 'COMPLETED',
            endDate: new Date(),
          },
        });

        await tx.project.update({
          where: { id: milestone.contract.projectId },
          data: { status: 'COMPLETED' },
        });
      }

      // 4. Notify freelancer
      await tx.notification.create({
        data: {
          userId: milestone.contract.freelancerProfile.userId,
          title: 'Milestone Approved! Funds Released',
          message: `Milestone "${milestone.title}" has been approved by the client.`,
          type: 'MILESTONE',
          link: `/freelancer/contracts/${milestone.contractId}`,
        },
      });

      return {
        milestone: approvedMilestone,
        contractCompleted: allCompleted,
      };
    });
  }
}
