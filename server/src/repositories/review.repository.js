import { prisma } from '../config/database.js';

export class ReviewRepository {
  static async createReview(data) {
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

  static async findExistingReview(contractId, authorId) {
    return prisma.review.findFirst({
      where: {
        contractId,
        authorId,
      },
    });
  }

  static async getReviewsForContract(contractId) {
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

  static async getReviewsForRecipient(recipientId) {
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

  static async calculateAverageRating(recipientId) {
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

  static async updateFreelancerProfileRating(freelancerProfileId, rating, reviewCount) {
    return prisma.freelancerProfile.update({
      where: { id: freelancerProfileId },
      data: {
        rating,
        reviewCount,
      },
    });
  }

  static async updateClientProfileRating(clientProfileId, rating, reviewCount) {
    return prisma.clientProfile.update({
      where: { id: clientProfileId },
      data: {
        rating,
        reviewCount,
      },
    });
  }
}

export default ReviewRepository;
