import { prisma } from '../config/database.js';
import { ApiError } from '../utils/api-error.js';

export class ReviewService {
  static async submitReview(userId, data) {
    const contract = await prisma.contract.findUnique({
      where: { id: data.contractId },
      include: {
        client: true,
        freelancerProfile: true,
      },
    });

    if (!contract) {
      throw ApiError.notFound('Contract not found');
    }

    if (contract.status !== 'COMPLETED') {
      throw ApiError.badRequest('Reviews can only be submitted for completed contracts');
    }

    // Determine recipient
    const isClientAuthor = contract.client.userId === userId;
    const isFreelancerAuthor = contract.freelancerProfile.userId === userId;

    if (!isClientAuthor && !isFreelancerAuthor) {
      throw ApiError.forbidden('Only participants of this contract can submit a review');
    }

    const recipientId = isClientAuthor ? contract.freelancerProfile.userId : contract.client.userId;

    // Prevent duplicate reviews
    const existing = await prisma.review.findUnique({
      where: {
        contractId_authorId: {
          contractId: data.contractId,
          authorId: userId,
        },
      },
    });

    if (existing) {
      throw ApiError.conflict('You have already submitted a review for this contract');
    }

    return prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          contractId: data.contractId,
          authorId: userId,
          recipientId,
          rating: data.rating,
          comment: data.comment,
        },
      });

      // Recalculate average rating for recipient
      const allRecipientReviews = await tx.review.findMany({
        where: { recipientId },
        select: { rating: true },
      });

      const avgRating =
        allRecipientReviews.reduce((sum, r) => sum + r.rating, 0) / allRecipientReviews.length;

      if (isClientAuthor) {
        // Recipient is freelancer
        await tx.freelancerProfile.update({
          where: { id: contract.freelancerProfileId },
          data: {
            rating: Number(avgRating.toFixed(2)),
            reviewCount: allRecipientReviews.length,
          },
        });
      } else {
        // Recipient is client
        await tx.clientProfile.update({
          where: { id: contract.clientId },
          data: {
            rating: Number(avgRating.toFixed(2)),
            reviewCount: allRecipientReviews.length,
          },
        });
      }

      return review;
    });
  }

  static async getFreelancerReviews(freelancerProfileId) {
    const profile = await prisma.freelancerProfile.findUnique({
      where: { id: freelancerProfileId },
      select: { userId: true },
    });

    if (!profile) {
      throw ApiError.notFound('Freelancer profile not found');
    }

    return prisma.review.findMany({
      where: { recipientId: profile.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { firstName: true, lastName: true, avatarUrl: true } },
        contract: { select: { project: { select: { title: true } } } },
      },
    });
  }
}
