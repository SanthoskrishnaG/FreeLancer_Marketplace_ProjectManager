import { PaymentStatus } from '@prisma/client';

export interface ProcessPaymentParams {
  invoiceId: string;
  amount: number;
  currency?: string;
  description?: string;
  paymentMethod?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  provider: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  message?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface RefundParams {
  transactionId: string;
  amount?: number;
  reason?: string;
}

export interface RefundResult {
  success: boolean;
  refundTransactionId: string;
  status: PaymentStatus;
  amount: number;
  message?: string;
  timestamp: Date;
}

export interface PaymentProvider {
  readonly name: string;
  processPayment(params: ProcessPaymentParams): Promise<PaymentResult>;
  verifyPayment(transactionId: string): Promise<PaymentResult>;
  refundPayment(params: RefundParams): Promise<RefundResult>;
}
