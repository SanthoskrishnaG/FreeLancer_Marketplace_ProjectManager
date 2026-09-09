import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/freelancer/:freelancerId', ReviewController.getFreelancerReviews);
router.post('/', authenticate, ReviewController.createReview);

export default router;
