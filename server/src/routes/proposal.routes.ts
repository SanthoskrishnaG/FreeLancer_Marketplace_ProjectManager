import { Router } from 'express';
import { ProposalController } from '../controllers/proposal.controller.js';
import { requireAuth } from '../middleware/index.js';
import { validateRequest, createProposalSchema, proposalQuerySchema } from '../validators/index.js';

const router = Router();

// Freelancer Proposal endpoints
router.post(
  '/',
  requireAuth,
  validateRequest(createProposalSchema),
  ProposalController.createProposal
);
router.get(
  '/my-proposals',
  requireAuth,
  validateRequest(proposalQuerySchema),
  ProposalController.getMyProposals
);

// Client Project Proposals (comparison view)
router.get(
  '/projects/:projectId',
  requireAuth,
  validateRequest(proposalQuerySchema),
  ProposalController.getProjectProposals
);

// Specific Proposal actions
router.get('/:id', requireAuth, ProposalController.getProposalById);
router.patch('/:id/withdraw', requireAuth, ProposalController.withdrawProposal);
router.patch('/:id/shortlist', requireAuth, ProposalController.shortlistProposal);
router.patch('/:id/reject', requireAuth, ProposalController.rejectProposal);
router.patch('/:id/accept', requireAuth, ProposalController.acceptProposal);

export default router;
