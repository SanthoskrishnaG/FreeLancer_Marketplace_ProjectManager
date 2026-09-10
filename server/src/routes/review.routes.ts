import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller.js';
import { requireAuth } from '../middleware/index.js';
import { validateRequest, createReviewSchema } from '../validators/index.js';

const router = Router();

// Submit review on completed contract
router.post('/', requireAuth, validateRequest(createReviewSchema), ReviewController.submitReview);

// Get reviews for contract
router.get('/contract/:contractId', ReviewController.getContractReviews);

// Get reviews for freelancer profile
router.get('/freelancer/:freelancerProfileId', ReviewController.getFreelancerReviews);

export default router;
