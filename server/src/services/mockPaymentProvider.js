import crypto from 'crypto';

export class MockPaymentProvider {
  static async createOrder({ amount, currency = 'USD', invoiceId }) {
    const orderId = `order_mock_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    return {
      orderId,
      amount,
      currency,
      invoiceId,
      status: 'CREATED',
    };
  }

  static async verifyPayment({ orderId, paymentId, signature }) {
    return {
      success: true,
      transactionId: paymentId || `tx_mock_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      status: 'SUCCESS',
      verifiedAt: new Date(),
    };
  }

  static async processDirectPayment({ amount, invoiceId }) {
    return {
      success: true,
      transactionId: `tx_mock_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      amount,
      currency: 'USD',
      invoiceId,
      status: 'SUCCESS',
      provider: 'MOCK',
      timestamp: new Date(),
    };
  }
}
