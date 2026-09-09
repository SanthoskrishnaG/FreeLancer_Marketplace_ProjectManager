import { Router } from 'express';
import { DisputeController } from '../controllers/disputeController.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', DisputeController.createDispute);
router.get('/', DisputeController.getUserDisputes);
router.get('/:id', DisputeController.getDisputeById);

export default router;
