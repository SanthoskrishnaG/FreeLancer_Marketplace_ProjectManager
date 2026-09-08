import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/review.service.js';
import { ApiResponse } from '../utils/api-response.js';

export class ReviewController {
  public static async submitReview(req: Request, res: Response, next: NextFunction) {
    try {
      const review = await ReviewService.submitReview(req.user!.id, req.body);
      return res.status(201).json(ApiResponse.success(review, 'Review submitted successfully'));
    } catch (error) {
      next(error);
    }
  }

  public static async getContractReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const reviews = await ReviewService.getContractReviews(req.params.contractId);
      return res.status(200).json(ApiResponse.success(reviews));
    } catch (error) {
      next(error);
    }
  }

  public static async getFreelancerReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const reviews = await ReviewService.getFreelancerReviews(req.params.freelancerProfileId);
      return res.status(200).json(ApiResponse.success(reviews));
    } catch (error) {
      next(error);
    }
  }
}
