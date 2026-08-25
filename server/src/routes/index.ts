import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import { userRoutes, freelancerRoutes, metaRoutes } from './profile.routes.js';
import projectRoutes from './project.routes.js';
import proposalRoutes from './proposal.routes.js';
import contractRoutes from './contract.routes.js';
import milestoneRoutes from './milestone.routes.js';
import fileRoutes from './file.routes.js';
import chatRoutes from './chat.routes.js';

const router = Router();

// Mount sub-routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/freelancers', freelancerRoutes);
router.use('/meta', metaRoutes);
router.use('/projects', projectRoutes);
router.use('/proposals', proposalRoutes);
router.use('/contracts', contractRoutes);
router.use('/milestones', milestoneRoutes);
router.use('/files', fileRoutes);
router.use('/chat', chatRoutes);

export default router;
