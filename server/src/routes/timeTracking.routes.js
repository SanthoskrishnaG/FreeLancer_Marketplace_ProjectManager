import { Router } from 'express';
import { TimeTrackingController } from '../controllers/timeTrackingController.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/start', authorize(['FREELANCER']), TimeTrackingController.startTimer);
router.post('/:id/stop', authorize(['FREELANCER']), TimeTrackingController.stopTimer);
router.post('/manual', authorize(['FREELANCER']), TimeTrackingController.createManualEntry);
router.get('/contract/:contractId', TimeTrackingController.getContractTimeEntries);
router.get('/my/summary', authorize(['FREELANCER']), TimeTrackingController.getFreelancerTimeSummary);

export default router;
