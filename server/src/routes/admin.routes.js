import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// Strict Admin protection for all admin routes
router.use(authenticate, authorize(['ADMIN']));

// Overview & Analytics
router.get('/overview', AdminController.getOverview);
router.get('/analytics', AdminController.getAnalytics);

// User Management
router.get('/users', AdminController.getUsers);
router.patch('/users/:id/status', AdminController.updateUserStatus);

// Freelancer Moderation
router.get('/freelancers', AdminController.getFreelancers);
router.patch('/freelancers/:id/verify', AdminController.verifyFreelancer);

// Projects & Contracts
router.get('/projects', AdminController.getProjects);
router.patch('/projects/:id/status', AdminController.updateProjectStatus);
router.get('/contracts', AdminController.getContracts);

// Disputes
router.get('/disputes', AdminController.getDisputes);
router.post('/disputes/:id/resolve', AdminController.resolveDispute);

// Categories & Skills Management
router.get('/categories', AdminController.getCategories);
router.post('/categories', AdminController.createCategory);
router.put('/categories/:id', AdminController.updateCategory);
router.delete('/categories/:id', AdminController.deleteCategory);

router.get('/skills', AdminController.getSkills);
router.post('/skills', AdminController.createSkill);
router.delete('/skills/:id', AdminController.deleteSkill);

// Audit Logs
router.get('/audit-logs', AdminController.getAuditLogs);

export default router;
