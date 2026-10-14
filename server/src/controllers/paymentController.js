import { PaymentService } from '../services/paymentService.js';
import { ApiResponse } from '../utils/api-response.js';

export class PaymentController {
  static async createPaymentOrder(req, res, next) {
    try {
      const order = await PaymentService.createPaymentOrder(req.user.id, req.body);
      return ApiResponse.created(res, order, 'Payment order initiated');
    } catch (error) {
      next(error);
    }
  }

  static async verifyPayment(req, res, next) {
    try {
      const payment = await PaymentService.verifyPayment(req.body);
      return ApiResponse.success(res, payment, 'Payment verified successfully');
    } catch (error) {
      next(error);
    }
  }

  static async releaseEscrow(req, res, next) {
    try {
      const payment = await PaymentService.releaseEscrow(req.params.escrowId, req.user.id);
      return ApiResponse.success(res, payment, 'Escrow funds released');
    } catch (error) {
      next(error);
    }
  }

  static async checkout(req, res, next) {
    try {
      const payment = await PaymentService.processPayment(req.user.id, req.body);
      return ApiResponse.success(res, {
        status: payment.status,
        payment,
        ...payment,
      }, 'Payment processed successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getUserPayments(req, res, next) {
    try {
      const payments = await PaymentService.getUserPayments(req.user.id, req.user.role, req.query);
      return ApiResponse.success(res, payments, 'Payments history retrieved');
    } catch (error) {
      next(error);
    }
  }
}
