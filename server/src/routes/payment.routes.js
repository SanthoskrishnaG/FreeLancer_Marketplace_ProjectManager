import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/checkout', PaymentController.checkout);
router.get('/history', PaymentController.getUserPayments);
router.post('/order', PaymentController.createPaymentOrder);
router.post('/verify', PaymentController.verifyPayment);
router.post('/escrow/:escrowId/release', PaymentController.releaseEscrow);
router.get('/', PaymentController.getUserPayments);

export default router;
