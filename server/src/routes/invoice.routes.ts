import { Router } from 'express';
import { InvoiceController } from '../controllers/invoice.controller.js';
import { requireAuth } from '../middleware/index.js';
import { validateRequest } from '../middleware/index.js';
import { createInvoiceSchema } from '../validators/invoice.validator.js';

const router = Router();

// Financial metrics summary
router.get('/metrics', requireAuth, InvoiceController.getFinancialMetrics);

// Generate new invoice for contract/milestone
router.post(
  '/',
  requireAuth,
  validateRequest(createInvoiceSchema),
  InvoiceController.generateInvoice
);

// List user invoices
router.get('/', requireAuth, InvoiceController.getInvoices);

// Download PDF
router.get('/:id/pdf', requireAuth, InvoiceController.downloadInvoicePdf);

// Invoice details
router.get('/:id', requireAuth, InvoiceController.getInvoiceById);

export default router;
