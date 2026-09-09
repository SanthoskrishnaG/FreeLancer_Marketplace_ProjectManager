import { ReviewService } from '../services/reviewService.js';
import { ApiResponse } from '../utils/api-response.js';

export class ReviewController {
  static async createReview(req, res, next) {
    try {
      const review = await ReviewService.createReview(req.user.id, req.body);
      return ApiResponse.created(res, review, 'Review submitted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getFreelancerReviews(req, res, next) {
    try {
      const reviews = await ReviewService.getFreelancerReviews(req.params.freelancerId);
      return ApiResponse.success(res, reviews, 'Freelancer reviews retrieved');
    } catch (error) {
      next(error);
    }
  }
}
