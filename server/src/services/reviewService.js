import { ReviewRepository } from '../repositories/review.repository.js';
import { ContractRepository } from '../repositories/contract.repository.js';
import { ProfileRepository } from '../repositories/profile.repository.js';
import { prisma } from '../config/database.js';
import { ApiError } from '../utils/api-error.js';

export class ReviewService {
  static async createReview(userId, input) {
    return this.submitReview(userId, input);
  }

  static async submitReview(userId, input) {
    const { contractId, rating, comment } = input;

    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user) throw ApiError.unauthorized('Authentication required');

    const contract = await ContractRepository.findContractById(contractId);
    if (!contract) throw ApiError.notFound('Contract not found');

    if (contract.status !== 'COMPLETED') {
      throw ApiError.badRequest('Reviews can only be submitted after a contract is COMPLETED');
    }

    const isClient = user.clientProfile && contract.clientId === user.clientProfile.id;
    const isFreelancer =
      user.freelancerProfile && contract.freelancerProfileId === user.freelancerProfile.id;

    if (!isClient && !isFreelancer) {
      throw ApiError.forbidden('Only parties to this contract can submit a review');
    }

    const existing = await ReviewRepository.findExistingReview(contractId, user.id);
    if (existing) {
      throw ApiError.badRequest(
        'You have already submitted a review for this contract. Duplicate reviews are not allowed.'
      );
    }

    let recipientId;
    let isReviewingFreelancer = false;
    if (isClient) {
      recipientId = contract.freelancerProfile?.userId || contract.freelancerProfile?.user?.id;
      isReviewingFreelancer = true;
    } else {
      recipientId = contract.client?.userId || contract.client?.user?.id;
      isReviewingFreelancer = false;
    }

    const review = await ReviewRepository.createReview({
      contractId,
      authorId: user.id,
      recipientId,
      rating,
      comment,
    });

    const stats = await ReviewRepository.calculateAverageRating(recipientId);
    if (isReviewingFreelancer) {
      await ReviewRepository.updateFreelancerProfileRating(
        contract.freelancerProfileId,
        stats.average,
        stats.count
      );
    } else {
      await ReviewRepository.updateClientProfileRating(
        contract.clientId,
        stats.average,
        stats.count
      );
    }

    return review;
  }

  static async getFreelancerReviews(freelancerId) {
    let targetUserId = freelancerId;
    const profile = await prisma.freelancerProfile.findUnique({
      where: { id: freelancerId },
      select: { userId: true },
    });
    if (profile) targetUserId = profile.userId;

    return ReviewRepository.getReviewsForRecipient(targetUserId);
  }
}

export default ReviewService;
