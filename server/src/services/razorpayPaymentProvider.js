import crypto from 'crypto';
import { envConfig } from '../config/env.config.js';

export class RazorpayPaymentProvider {
  static async createOrder({ amount, currency = 'USD', invoiceId }) {
    if (!envConfig.razorpay.keyId || !envConfig.razorpay.keySecret) {
      throw new Error('Razorpay keys not configured');
    }

    const auth = Buffer.from(`${envConfig.razorpay.keyId}:${envConfig.razorpay.keySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // in cents / paise
        currency,
        receipt: `rcpt_${invoiceId.substring(0, 10)}`,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.description || 'Razorpay order creation failed');
    }

    const data = await response.json();
    return {
      orderId: data.id,
      amount,
      currency,
      invoiceId,
      status: data.status,
    };
  }

  static verifySignature({ orderId, paymentId, signature }) {
    const secret = envConfig.razorpay.keySecret;
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === signature;
  }
}
