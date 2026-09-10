import { Router } from 'express';
import { MilestoneController } from '../controllers/milestone.controller.js';
import { requireAuth } from '../middleware/index.js';
import {
  validateRequest,
  submitMilestoneSchema,
  requestRevisionSchema,
} from '../validators/index.js';

const router = Router();

router.post('/:id/start', requireAuth, MilestoneController.startMilestone);
router.post(
  '/:id/submit',
  requireAuth,
  validateRequest(submitMilestoneSchema),
  MilestoneController.submitMilestone
);
router.post('/:id/approve', requireAuth, MilestoneController.approveMilestone);
router.post(
  '/:id/request-revision',
  requireAuth,
  validateRequest(requestRevisionSchema),
  MilestoneController.requestRevision
);
router.get('/:id/history', requireAuth, MilestoneController.getHistory);

export default router;
