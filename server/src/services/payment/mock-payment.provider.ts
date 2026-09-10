import {
  PaymentProvider,
  ProcessPaymentParams,
  PaymentResult,
  RefundParams,
  RefundResult,
} from './payment-provider.interface.js';
import { PaymentStatus } from '@prisma/client';
import crypto from 'crypto';

export class MockPaymentProvider implements PaymentProvider {
  public readonly name = 'MOCK';

  public async processPayment(params: ProcessPaymentParams): Promise<PaymentResult> {
    const { invoiceId, amount, currency = 'USD', paymentMethod = 'mock_card', metadata } = params;

    if (amount <= 0) {
      return {
        success: false,
        transactionId: `txn_fail_${crypto.randomBytes(8).toString('hex')}`,
        provider: this.name,
        amount,
        currency,
        status: PaymentStatus.FAILED,
        message: 'Payment amount must be greater than zero',
        timestamp: new Date(),
        metadata: {
          invoiceId,
          reason: 'INVALID_AMOUNT',
        },
      };
    }

    // Simulate realistic transaction ID and mock provider payload
    const transactionId = `txn_mock_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;

    return {
      success: true,
      transactionId,
      provider: this.name,
      amount,
      currency,
      status: PaymentStatus.COMPLETED,
      message: 'Payment processed successfully via Mock Payment Provider',
      timestamp: new Date(),
      metadata: {
        invoiceId,
        paymentMethod,
        authCode: `AUTH_${Math.floor(100000 + Math.random() * 900000)}`,
        simulatedAt: new Date().toISOString(),
        ...metadata,
      },
    };
  }

  public async verifyPayment(transactionId: string): Promise<PaymentResult> {
    return {
      success: true,
      transactionId,
      provider: this.name,
      amount: 0,
      currency: 'USD',
      status: PaymentStatus.COMPLETED,
      message: 'Transaction verified with Mock Provider ledger',
      timestamp: new Date(),
    };
  }

  public async refundPayment(params: RefundParams): Promise<RefundResult> {
    const { transactionId, amount = 0, reason = 'Customer requested refund' } = params;
    const refundTransactionId = `re_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;

    return {
      success: true,
      refundTransactionId,
      status: PaymentStatus.REFUNDED,
      amount,
      message: `Refund successful: ${reason}`,
      timestamp: new Date(),
    };
  }
}
