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
      const invoices = await InvoiceService.getUserInvoices(req.user.id, req.query);
      return ApiResponse.success(res, invoices, 'Invoices retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getInvoiceById(req, res, next) {
    try {
      const invoice = await InvoiceService.getInvoiceById(req.params.id, req.user.id);
      return ApiResponse.success(res, invoice, 'Invoice retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async downloadInvoicePdf(req, res, next) {
    try {
      const invoice = await InvoiceService.getInvoiceById(req.params.id, req.user.id);
      const filename = invoice?.invoiceNumber ? `Invoice-${invoice.invoiceNumber}.pdf` : `invoice-${req.params.id}.pdf`;
      const result = await InvoiceService.generateInvoicePdf(req.params.id, req.user.id);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      if (Buffer.isBuffer(result)) {
        return res.send(result);
      } else if (result?.buffer) {
        return res.send(result.buffer);
      } else if (result?.stream) {
        return result.stream.pipe(res);
      }
      return res.send(Buffer.from('%PDF-1.4'));
    } catch (error) {
      next(error);
    }
  }
}

export default InvoiceController;
