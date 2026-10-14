import { prisma } from '../config/database.js';

export class MilestoneRepository {
  static async findMilestoneById(milestoneId) {
    return prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        contract: {
          include: {
            client: true,
            freelancerProfile: true,
            project: true,
          },
        },
        project: {
          include: {
            client: true,
          },
        },
        submissions: {
          orderBy: { submittedAt: 'desc' },
          include: {
            files: true,
            revisions: true,
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
        },
        revisions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  static async startMilestone(milestoneId) {
    return prisma.milestone.update({
      where: { id: milestoneId },
      data: { status: 'IN_PROGRESS' },
      include: {
        submissions: {
          include: { files: true },
        },
      },
    });
  }

  static async createSubmission(milestoneId, freelancerProfileId, data) {
    const { description = 'Milestone submission', notes, links, fileIds } = data;

    return prisma.$transaction(async (tx) => {
      const submission = await tx.milestoneSubmission.create({
        data: {
          milestoneId,
          freelancerProfileId,
          description: description || 'Deliverables submitted for milestone',
          notes: notes || null,
          links: links || [],
        },
      });

      if (fileIds && fileIds.length > 0) {
        await tx.file.updateMany({
          where: { id: { in: fileIds } },
          data: {
            milestoneSubmissionId: submission.id,
            entityType: 'MILESTONE',
            entityId: milestoneId,
          },
        });
      }

      await tx.milestone.update({
        where: { id: milestoneId },
        data: { status: 'SUBMITTED' },
      });

      return tx.milestoneSubmission.findUnique({
        where: { id: submission.id },
        include: { files: true },
      });
    });
  }

  static async approveMilestone(milestoneId) {
    return prisma.milestone.update({
      where: { id: milestoneId },
      data: { status: 'APPROVED' },
      include: {
        contract: true,
        submissions: {
          include: { files: true },
        },
      },
    });
  }

  static async createRevisionRequest(milestoneId, data) {
    const { feedback = 'Revision requested', requestedChanges, dueDate } = data;

    return prisma.$transaction(async (tx) => {
      const latestSubmission = await tx.milestoneSubmission.findFirst({
        where: { milestoneId },
        orderBy: { submittedAt: 'desc' },
      });

      const revision = await (tx.revision || tx.milestoneRevision).create({
        data: {
          milestoneId,
          submissionId: latestSubmission?.id || null,
          feedback: feedback || 'Please review and make adjustments as discussed.',
          requestedChanges: requestedChanges || [],
          dueDate: dueDate ? new Date(dueDate) : null,
        },
      });

      await tx.milestone.update({
        where: { id: milestoneId },
        data: { status: 'REVISION_REQUESTED' },
      });

      return revision;
    });
  }

  static async getMilestoneHistory(milestoneId) {
    return prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        submissions: {
          orderBy: { submittedAt: 'asc' },
          include: {
            files: true,
            revisions: true,
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
        },
        revisions: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }
}

export default MilestoneRepository;
