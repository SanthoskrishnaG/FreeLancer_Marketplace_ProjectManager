import { Router } from 'express';
import { ProposalController } from '../controllers/proposalController.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/index.js';
import { submitProposalSchema } from '../validators/proposal.validator.js';

const router = Router();

router.use(authenticate);

// Freelancer submissions
router.post(
  '/',
  authorize(['FREELANCER']),
  validate(submitProposalSchema),
  ProposalController.submitProposal
);
router.get('/my/proposals', authorize(['FREELANCER']), ProposalController.getFreelancerProposals);

// Client project proposals
router.get('/project/:projectId', authorize(['CLIENT', 'ADMIN']), ProposalController.getProjectProposals);
router.get('/:id', ProposalController.getProposalById);

// Acceptance & Actions
router.post('/:id/accept', authorize(['CLIENT']), ProposalController.acceptProposal);
router.patch('/:id/accept', authorize(['CLIENT']), ProposalController.acceptProposal);
router.post('/:id/reject', authorize(['CLIENT']), ProposalController.rejectProposal);
router.patch('/:id/reject', authorize(['CLIENT']), ProposalController.rejectProposal);
router.patch('/:id/shortlist', authorize(['CLIENT']), ProposalController.shortlistProposal);
router.patch('/:id/withdraw', authorize(['FREELANCER']), ProposalController.withdrawProposal);

export default router;
