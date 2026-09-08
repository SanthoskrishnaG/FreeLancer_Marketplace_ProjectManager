import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller.js';
import { requireAuth, validateRequest } from '../middleware/index.js';
import { createReviewSchema } from '../validators/review.validator.js';

const router = Router();

// Submit review on completed contract
router.post('/', requireAuth, validateRequest(createReviewSchema), ReviewController.submitReview);

// Get reviews for contract
router.get('/contract/:contractId', ReviewController.getContractReviews);

// Get reviews for freelancer profile
router.get('/freelancer/:freelancerProfileId', ReviewController.getFreelancerReviews);

export default router;
