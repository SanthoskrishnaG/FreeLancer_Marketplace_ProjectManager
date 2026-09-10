import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service.js';
import { ApiResponse } from '../utils/api-response.js';

export class PaymentController {
  public static async processPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PaymentService.processPayment(req.user!.id, req.body);
      return res.status(200).json(ApiResponse.success(result, 'Payment completed successfully'));
    } catch (error) {
      next(error);
    }
  }

  public static async getPaymentHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const history = await PaymentService.getPaymentHistory(req.user!.id, req.query);
      return res.status(200).json(ApiResponse.success(history));
    } catch (error) {
      next(error);
    }
  }

  public static async getPaymentById(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await PaymentService.getPaymentById(req.user!.id, req.params.id);
      return res.status(200).json(ApiResponse.success(payment));
    } catch (error) {
      next(error);
    }
  }
}
