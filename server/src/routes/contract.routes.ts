import { Router } from 'express';
import { ContractController } from '../controllers/contract.controller.js';
import { requireAuth } from '../middleware/index.js';
import {
  validateRequest,
  updateContractStatusSchema,
  contractQuerySchema,
} from '../validators/index.js';

const router = Router();

router.get(
  '/my-contracts',
  requireAuth,
  validateRequest(contractQuerySchema),
  ContractController.getMyContracts
);
router.get('/:id', requireAuth, ContractController.getContractById);
router.patch(
  '/:id/status',
  requireAuth,
  validateRequest(updateContractStatusSchema),
  ContractController.updateContractStatus
);

export default router;
