import { Router } from 'express';
import { ContractController } from '../controllers/contractController.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/my-contracts', ContractController.getUserContracts);
router.get('/', ContractController.getUserContracts);
router.get('/:id', ContractController.getContractById);
router.post('/:id/complete', ContractController.completeContract);
router.post('/:id/cancel', ContractController.cancelContract);

export default router;
