import { Router } from 'express';
import { ProjectController } from '../controllers/projectController.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/index.js';
import { createProjectSchema, createProjectIdeaSchema } from '../validators/project.validator.js';

const router = Router();

// Public lookups
router.get('/categories', ProjectController.getCategories);
router.get('/skills', ProjectController.getSkills);
router.get('/', ProjectController.getProjects);
router.get('/:id', ProjectController.getProjectById);

// Protected Client routes
router.post(
  '/',
  authenticate,
  authorize(['CLIENT', 'ADMIN']),
  validate(createProjectSchema),
  ProjectController.createProject
);

// Protected Freelancer routes (Project Ideas)
router.post(
  '/ideas',
  authenticate,
  authorize(['FREELANCER', 'ADMIN']),
  validate(createProjectIdeaSchema),
  ProjectController.createProjectIdea
);
router.get(
  '/my/ideas',
  authenticate,
  authorize(['FREELANCER', 'ADMIN']),
  ProjectController.getFreelancerProjects
);

router.get(
  '/my/projects',
  authenticate,
  authorize(['CLIENT', 'FREELANCER', 'ADMIN']),
  ProjectController.getClientProjects
);
router.put('/:id', authenticate, ProjectController.updateProject);
router.delete('/:id', authenticate, ProjectController.deleteProject);

// AI Assistance
router.post(
  '/ai/analyze-requirements',
  authenticate,
  ProjectController.analyzeRequirementsWithAi
);
router.post(
  '/ai/generate-milestones',
  authenticate,
  ProjectController.generateMilestonesWithAi
);
router.post(
  '/:id/generate-milestones',
  authenticate,
  ProjectController.generateMilestonesWithAi
);

// Nested Proposals on Projects
router.get(
  '/:projectId/proposals',
  authenticate,
  authorize(['CLIENT', 'ADMIN']),
  (req, res, next) => {
    import('../controllers/proposalController.js').then(({ ProposalController }) =>
      ProposalController.getProjectProposals(req, res, next)
    );
  }
);
router.post(
  '/:projectId/proposals',
  authenticate,
  authorize(['FREELANCER']),
  (req, res, next) => {
    req.body.projectId = req.params.projectId;
    import('../controllers/proposalController.js').then(({ ProposalController }) =>
      ProposalController.submitProposal(req, res, next)
    );
  }
);

// Project Folders & Records
router.get('/:projectId/folders', authenticate, ProjectController.getProjectFolders);
router.post('/:projectId/folders', authenticate, ProjectController.createProjectFolder);
router.delete('/:projectId/folders/:folderId', authenticate, ProjectController.deleteProjectFolder);
router.post('/:projectId/folders/:folderId/files', authenticate, ProjectController.addProjectFile);
router.delete('/:projectId/folders/:folderId/files/:fileId', authenticate, ProjectController.deleteProjectFile);

export default router;
