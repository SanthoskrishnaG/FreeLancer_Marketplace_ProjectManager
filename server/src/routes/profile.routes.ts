import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  validateRequest,
  updateProfileSchema,
  addFreelancerSkillSchema,
  freelancerQuerySchema,
} from '../validators/index.js';

export const userRoutes = Router();
export const freelancerRoutes = Router();
export const metaRoutes = Router();

// User profile endpoints (/api/users)
userRoutes.get('/me', requireAuth, ProfileController.getMe);
userRoutes.put(
  '/me',
  requireAuth,
  validateRequest(updateProfileSchema),
  ProfileController.updateMe
);

// Freelancer directory endpoints (/api/freelancers)
freelancerRoutes.get(
  '/',
  validateRequest(freelancerQuerySchema),
  ProfileController.listFreelancers
);
freelancerRoutes.get('/:id', ProfileController.getFreelancerById);
freelancerRoutes.post(
  '/skills',
  requireAuth,
  validateRequest(addFreelancerSkillSchema),
  ProfileController.addSkill
);
freelancerRoutes.delete('/skills/:skillId', requireAuth, ProfileController.removeSkill);

// Meta endpoints (/api/meta)
metaRoutes.get('/skills-categories', ProfileController.getMeta);
