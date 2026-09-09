import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get(
  '/client',
  authorize(['CLIENT', 'ADMIN']),
  DashboardController.getClientDashboard
);

router.get(
  '/freelancer',
  authorize(['FREELANCER', 'ADMIN']),
  DashboardController.getFreelancerDashboard
);

export default router;
