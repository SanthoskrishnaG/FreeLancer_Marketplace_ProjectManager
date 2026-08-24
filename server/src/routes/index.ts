import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import { userRoutes, freelancerRoutes, metaRoutes } from './profile.routes.js';
import projectRoutes from './project.routes.js';
import proposalRoutes from './proposal.routes.js';

const router = Router();

// Mount sub-routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/freelancers', freelancerRoutes);
router.use('/meta', metaRoutes);
router.use('/projects', projectRoutes);
router.use('/proposals', proposalRoutes);

export default router;
