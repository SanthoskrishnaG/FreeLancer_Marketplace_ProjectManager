import { Router } from 'express';
import authRoutes from './auth.routes.js';
import projectRoutes from './project.routes.js';
import proposalRoutes from './proposal.routes.js';
import contractRoutes from './contract.routes.js';
import milestoneRoutes from './milestone.routes.js';
import timeTrackingRoutes from './timeTracking.routes.js';
import invoiceRoutes from './invoice.routes.js';
import paymentRoutes from './payment.routes.js';
import reviewRoutes from './review.routes.js';
import disputeRoutes from './dispute.routes.js';
import chatRoutes from './chat.routes.js';
import notificationRoutes from './notification.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/proposals', proposalRoutes);
router.use('/contracts', contractRoutes);
router.use('/milestones', milestoneRoutes);
router.use('/time-tracking', timeTrackingRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/disputes', disputeRoutes);
router.use('/chat', chatRoutes);
router.use('/conversations', chatRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboards', dashboardRoutes);
router.use('/admin', adminRoutes);

export default router;
