import { Router } from 'express';
import { DisputeController } from '../controllers/dispute.controller.js';
import { requireAuth, requireRole } from '../middleware/index.js';
import {
  validateRequest,
  createDisputeSchema,
  addDisputeMessageSchema,
  resolveDisputeSchema,
  rejectDisputeSchema,
  updateDisputeStatusSchema,
} from '../validators/index.js';
import { UserRole } from '@prisma/client';

const router = Router();

// Create dispute on contract
router.post(
  '/',
  requireAuth,
  validateRequest(createDisputeSchema),
  DisputeController.createDispute
);

// Get user disputes (or all disputes for admin)
router.get('/', requireAuth, DisputeController.getDisputes);

// Dispute detail
router.get('/:id', requireAuth, DisputeController.getDisputeById);

// Add message to dispute
router.post(
  '/:id/messages',
  requireAuth,
  validateRequest(addDisputeMessageSchema),
  DisputeController.addMessage
);

// Admin: Update dispute status (e.g., UNDER_REVIEW)
router.patch(
  '/:id/status',
  requireAuth,
  requireRole(UserRole.ADMIN),
  validateRequest(updateDisputeStatusSchema),
  DisputeController.updateStatus
);

// Admin: Resolve dispute
router.post(
  '/:id/resolve',
  requireAuth,
  requireRole(UserRole.ADMIN),
  validateRequest(resolveDisputeSchema),
  DisputeController.resolveDispute
);

// Admin: Reject dispute
router.post(
  '/:id/reject',
  requireAuth,
  requireRole(UserRole.ADMIN),
  validateRequest(rejectDisputeSchema),
  DisputeController.rejectDispute
);

// Admin: View dispute audit logs
router.get(
  '/:id/audit-logs',
  requireAuth,
  requireRole(UserRole.ADMIN),
  DisputeController.getAuditLogs
);

export default router;
