import { prisma } from '../config/database.js';

export class ReviewRepository {
  public static async createReview(data: {
    contractId: string;
    authorId: string;
    recipientId: string;
    rating: number;
    comment: string;
  }) {
    return prisma.review.create({
      data,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            role: true,
          },
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            role: true,
          },
        },
        contract: {
          select: {
            id: true,
            project: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });
  }

  public static async findExistingReview(contractId: string, authorId: string) {
    return prisma.review.findUnique({
      where: {
        contractId_authorId: {
          contractId,
          authorId,
        },
      },
    });
  }

  public static async getReviewsForContract(contractId: string) {
    return prisma.review.findMany({
      where: { contractId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });
  }

  public static async getReviewsForRecipient(recipientId: string) {
    return prisma.review.findMany({
      where: { recipientId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            role: true,
          },
        },
        contract: {
          select: {
            project: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });
  }

  public static async calculateAverageRating(recipientId: string) {
    const aggregate = await prisma.review.aggregate({
      where: { recipientId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const average = aggregate._avg.rating || 0;
    const count = aggregate._count.rating || 0;

    return {
      average: Math.round(average * 10) / 10,
      count,
    };
  }

  public static async updateFreelancerProfileRating(
    freelancerProfileId: string,
    rating: number,
    reviewCount: number
  ) {
    return prisma.freelancerProfile.update({
      where: { id: freelancerProfileId },
      data: {
        rating,
        reviewCount,
      },
    });
  }

  public static async updateClientProfileRating(
    clientProfileId: string,
    rating: number,
    reviewCount: number
  ) {
    return prisma.clientProfile.update({
      where: { id: clientProfileId },
      data: {
        rating,
        reviewCount,
      },
    });
  }
}
