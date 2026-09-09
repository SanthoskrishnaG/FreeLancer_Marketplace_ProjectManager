import { InvoiceService } from '../services/invoiceService.js';
import { ApiResponse } from '../utils/api-response.js';

export class InvoiceController {
  static async createInvoice(req, res, next) {
    try {
      const invoice = await InvoiceService.createInvoice(req.user.id, req.body);
      return ApiResponse.created(res, invoice, 'Invoice created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getUserInvoices(req, res, next) {
    try {
      const invoices = await InvoiceService.getUserInvoices(req.user.id, req.user.role, req.query);
      return ApiResponse.success(res, invoices, 'Invoices retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getInvoiceById(req, res, next) {
    try {
      const invoice = await InvoiceService.getInvoiceById(req.params.id, req.user.id, req.user.role);
      return ApiResponse.success(res, invoice, 'Invoice retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async downloadInvoicePdf(req, res, next) {
    try {
      const { invoice, stream } = await InvoiceService.generateInvoicePdf(req.params.id, req.user.id, req.user.role);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
      stream.pipe(res);
    } catch (error) {
      next(error);
    }
  }
}
