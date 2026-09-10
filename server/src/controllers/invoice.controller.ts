import { Request, Response, NextFunction } from 'express';
import { InvoiceService } from '../services/invoice.service.js';
import { ApiResponse } from '../utils/api-response.js';

export class InvoiceController {
  public static async generateInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await InvoiceService.generateInvoice(req.user!.id, req.body);
      return res.status(201).json(ApiResponse.success(invoice, 'Invoice created successfully'));
    } catch (error) {
      next(error);
    }
  }

  public static async getInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await InvoiceService.getInvoices(req.user!.id, req.query);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }

  public static async getInvoiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await InvoiceService.getInvoiceById(req.user!.id, req.params.id);
      return res.status(200).json(ApiResponse.success(invoice));
    } catch (error) {
      next(error);
    }
  }

  public static async downloadInvoicePdf(req: Request, res: Response, next: NextFunction) {
    try {
      const { buffer, fileName } = await InvoiceService.getInvoicePdf(
        req.user!.id,
        req.params.id
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', buffer.length);

      return res.end(buffer);
    } catch (error) {
      next(error);
    }
  }

  public static async getFinancialMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await InvoiceService.getFinancialMetrics(req.user!.id);
      return res.status(200).json(ApiResponse.success(metrics));
    } catch (error) {
      next(error);
    }
  }
}
