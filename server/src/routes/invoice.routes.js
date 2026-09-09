import { Router } from 'express';
import { InvoiceController } from '../controllers/invoiceController.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', InvoiceController.createInvoice);
router.get('/', InvoiceController.getUserInvoices);
router.get('/:id', InvoiceController.getInvoiceById);
router.get('/:id/pdf', InvoiceController.downloadInvoicePdf);

export default router;
