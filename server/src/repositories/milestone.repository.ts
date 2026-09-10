import { prisma } from '../config/database.js';
import { MilestoneStatus } from '@prisma/client';
import { SubmitMilestoneInput, RequestRevisionInput } from '../validators/milestone.validator.js';

export class MilestoneRepository {
  public static async findMilestoneById(milestoneId: string) {
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

  public static async startMilestone(milestoneId: string) {
    return prisma.milestone.update({
      where: { id: milestoneId },
      data: { status: MilestoneStatus.IN_PROGRESS },
      include: {
        submissions: {
          include: { files: true },
        },
      },
    });
  }

  public static async createSubmission(
    milestoneId: string,
    freelancerProfileId: string,
    data: SubmitMilestoneInput
  ) {
    const { description, notes, links, fileIds } = data;

    return prisma.$transaction(async (tx) => {
      // 1. Create the submission record
      const submission = await tx.milestoneSubmission.create({
        data: {
          milestoneId,
          freelancerProfileId,
          description,
          notes,
          links: links || [],
        },
      });

      // 2. Link any uploaded files to this submission
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

      // 3. Update milestone status to SUBMITTED
      await tx.milestone.update({
        where: { id: milestoneId },
        data: { status: MilestoneStatus.SUBMITTED },
      });

      return tx.milestoneSubmission.findUnique({
        where: { id: submission.id },
        include: {
          files: true,
        },
      });
    });
  }

  public static async approveMilestone(milestoneId: string) {
    return prisma.milestone.update({
      where: { id: milestoneId },
      data: { status: MilestoneStatus.APPROVED },
      include: {
        contract: true,
        submissions: {
          include: { files: true },
        },
      },
    });
  }

  public static async createRevisionRequest(milestoneId: string, data: RequestRevisionInput) {
    const { feedback, requestedChanges, dueDate } = data;

    return prisma.$transaction(async (tx) => {
      // Find the latest submission for reference
      const latestSubmission = await tx.milestoneSubmission.findFirst({
        where: { milestoneId },
        orderBy: { submittedAt: 'desc' },
      });

      // 1. Create the revision record
      const revision = await tx.milestoneRevision.create({
        data: {
          milestoneId,
          submissionId: latestSubmission?.id || null,
          feedback,
          requestedChanges: requestedChanges || [],
          dueDate: dueDate ? new Date(dueDate) : null,
        },
      });

      // 2. Update milestone status to REVISION_REQUESTED
      await tx.milestone.update({
        where: { id: milestoneId },
        data: { status: MilestoneStatus.REVISION_REQUESTED },
      });

      return revision;
    });
  }

  public static async getMilestoneHistory(milestoneId: string) {
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
