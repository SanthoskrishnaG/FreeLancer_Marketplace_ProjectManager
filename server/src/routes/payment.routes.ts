import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller.js';
import { requireAuth } from '../middleware/index.js';
import {
  validateRequest,
  processPaymentSchema,
  paymentQuerySchema,
} from '../validators/index.js';

const router = Router();

// Process payment for invoice
router.post(
  '/checkout',
  requireAuth,
  validateRequest(processPaymentSchema),
  PaymentController.processPayment
);

// Payment transaction history
router.get(
  '/history',
  requireAuth,
  validateRequest(paymentQuerySchema),
  PaymentController.getPaymentHistory
);

// Specific payment record
router.get('/:id', requireAuth, PaymentController.getPaymentById);

export default router;
