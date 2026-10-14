import { Router } from 'express';
import { DisputeController } from '../controllers/disputeController.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', DisputeController.createDispute);
router.get('/', DisputeController.getUserDisputes);
router.get('/:id', DisputeController.getDisputeById);
router.post('/:id/messages', DisputeController.addMessage);
router.post('/:id/resolve', DisputeController.resolveDispute);
router.post('/:id/reject', DisputeController.rejectDispute);

export default router;
