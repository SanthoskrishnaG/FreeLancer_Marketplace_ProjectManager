import { Router } from 'express';
import { MilestoneController } from '../controllers/milestoneController.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { validate } from '../middleware/index.js';
import { submitMilestoneSchema, requestRevisionSchema } from '../validators/milestone.validator.js';

const router = Router();

router.use(authenticate);

router.get('/contract/:contractId', MilestoneController.getMilestonesByContract);
router.get('/:id', MilestoneController.getMilestoneById);
router.post('/:id/start', authorize(['FREELANCER']), MilestoneController.startMilestone);

router.post(
  '/:id/submit',
  authorize(['FREELANCER']),
  upload.single('file'),
  validate(submitMilestoneSchema),
  MilestoneController.submitMilestoneWork
);

router.post(
  '/:id/approve',
  authorize(['CLIENT']),
  MilestoneController.approveMilestone
);

router.post(
  '/:id/revision',
  authorize(['CLIENT']),
  validate(requestRevisionSchema),
  MilestoneController.requestRevision
);

export default router;
