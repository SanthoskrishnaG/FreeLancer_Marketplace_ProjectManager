import { ReviewRepository } from '../repositories/review.repository.js';
import { ContractRepository } from '../repositories/contract.repository.js';
import { ProfileRepository } from '../repositories/profile.repository.js';
import { prisma } from '../config/database.js';
import { ApiError } from '../utils/api-error.js';
import { CreateReviewInput } from '../validators/review.validator.js';
import { ContractStatus, NotificationType } from '@prisma/client';

export class ReviewService {
  public static async submitReview(userId: string, input: CreateReviewInput) {
    const { contractId, rating, comment } = input;

    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user) throw ApiError.unauthorized('Authentication required');

    const contract = await ContractRepository.findContractById(contractId);
    if (!contract) throw ApiError.notFound('Contract not found');

    if (contract.status !== ContractStatus.COMPLETED) {
      throw ApiError.badRequest('Reviews can only be submitted after a contract is COMPLETED');
    }

    const isClient = user.clientProfile && contract.clientId === user.clientProfile.id;
    const isFreelancer =
      user.freelancerProfile && contract.freelancerProfileId === user.freelancerProfile.id;

    if (!isClient && !isFreelancer) {
      throw ApiError.forbidden('Only parties to this contract can submit a review');
    }

    // Check for duplicate review
    const existing = await ReviewRepository.findExistingReview(contractId, user.id);
    if (existing) {
      throw ApiError.badRequest('You have already submitted a review for this contract. Duplicate reviews are not allowed.');
    }

    // Determine reviewee recipient
    let recipientId: string;
    let isReviewingFreelancer = false;

    if (isClient) {
      recipientId = contract.freelancerProfile.userId;
      isReviewingFreelancer = true;
    } else {
      recipientId = contract.client.userId;
      isReviewingFreelancer = false;
    }

    // 1. Create the review
    const review = await ReviewRepository.createReview({
      contractId,
      authorId: user.id,
      recipientId,
      rating,
      comment,
    });

    // 2. Recalculate average rating & review count for reviewee
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

    // 3. Send Notification
    await prisma.notification.create({
      data: {
        userId: recipientId,
        title: 'New Review Received!',
        message: `${user.firstName} left you a ${rating}-star review for contract "${contract.project?.title || 'Project'}".`,
        type: NotificationType.REVIEW,
        link: isReviewingFreelancer ? `/freelancers/${contract.freelancerProfileId}` : `/contracts/${contract.id}`,
      },
    });

    return review;
  }

  public static async getContractReviews(contractId: string) {
    const contract = await ContractRepository.findContractById(contractId);
    if (!contract) throw ApiError.notFound('Contract not found');

    return ReviewRepository.getReviewsForContract(contractId);
  }

  public static async getFreelancerReviews(freelancerProfileId: string) {
    const profile = await prisma.freelancerProfile.findUnique({
      where: { id: freelancerProfileId },
      select: { userId: true },
    });

    if (!profile) throw ApiError.notFound('Freelancer profile not found');

    return ReviewRepository.getReviewsForRecipient(profile.userId);
  }
}
