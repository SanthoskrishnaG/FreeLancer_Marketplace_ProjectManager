import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller.js';
import { requireAuth, optionalAuth } from '../middleware/index.js';
import {
  validateRequest,
  createProjectSchema,
  updateProjectSchema,
  updateProjectStatusSchema,
  projectQuerySchema,
  generateMilestonesSchema,
  saveBatchMilestonesSchema,
} from '../validators/index.js';

const router = Router();

// Public marketplace project browsing (with optional auth for bookmark status)
router.get(
  '/',
  optionalAuth,
  validateRequest(projectQuerySchema),
  ProjectController.getPublicProjects
);

// Client project management
router.get('/my-projects', requireAuth, ProjectController.getMyProjects);
router.get('/bookmarks', requireAuth, ProjectController.getBookmarks);

// Specific project operations
router.post(
  '/',
  requireAuth,
  validateRequest(createProjectSchema),
  ProjectController.createProject
);
router.get('/:id', optionalAuth, ProjectController.getProjectById);
router.put(
  '/:id',
  requireAuth,
  validateRequest(updateProjectSchema),
  ProjectController.updateProject
);
router.delete('/:id', requireAuth, ProjectController.deleteDraft);
router.patch(
  '/:id/status',
  requireAuth,
  validateRequest(updateProjectStatusSchema),
  ProjectController.updateStatus
);
router.post('/:id/bookmark', requireAuth, ProjectController.toggleBookmark);

// AI-Powered Requirement Analysis & Milestone Generation
router.post(
  '/:id/generate-milestones',
  requireAuth,
  validateRequest(generateMilestonesSchema),
  ProjectController.generateMilestones
);
router.post(
  '/:id/milestones/batch',
  requireAuth,
  validateRequest(saveBatchMilestonesSchema),
  ProjectController.saveBatchMilestones
);

export default router;
