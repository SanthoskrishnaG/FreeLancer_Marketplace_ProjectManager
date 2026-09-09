import { prisma } from '../config/database.js';
import { envConfig } from '../config/env.config.js';
import { MockPaymentProvider } from './mockPaymentProvider.js';
import { RazorpayPaymentProvider } from './razorpayPaymentProvider.js';
import { ApiError } from '../utils/api-error.js';

export class PaymentService {
  /**
   * Process payment for an invoice with fallback to mock provider
   */
  static async processInvoicePayment(userId, { invoiceId, paymentMethod = 'MOCK', paymentDetails = {} }) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        client: true,
        contract: true,
      },
    });

    if (!invoice) {
      throw ApiError.notFound('Invoice not found');
    }

    if (invoice.status === 'PAID') {
      throw ApiError.badRequest('Invoice has already been paid in full');
    }

    // Verify user is authorized client
    if (invoice.client.userId !== userId) {
      throw ApiError.forbidden('Only the billed client can pay this invoice');
    }

    let provider = 'MOCK';
    let transactionId = '';

    if (paymentMethod === 'RAZORPAY' && envConfig.razorpay.keyId) {
      provider = 'RAZORPAY';
      const isValid = RazorpayPaymentProvider.verifySignature({
        orderId: paymentDetails.orderId,
        paymentId: paymentDetails.paymentId,
        signature: paymentDetails.signature,
      });

      if (!isValid) {
        throw ApiError.badRequest('Invalid payment signature verification');
      }
      transactionId = paymentDetails.paymentId;
    } else {
      // Mock payment fallback
      const mockResult = await MockPaymentProvider.processDirectPayment({
        amount: Number(invoice.total),
        invoiceId: invoice.id,
      });
      transactionId = mockResult.transactionId;
    }

    // Execute atomic transaction: record payment, mark invoice paid, update client spent & freelancer earned
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          invoiceId: invoice.id,
          contractId: invoice.contractId,
          amount: invoice.total,
          currency: 'USD',
          provider,
          transactionId,
          status: 'SUCCESS',
        },
      });

      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
      });

      // Update client profile totalSpent
      await tx.clientProfile.update({
        where: { id: invoice.clientId },
        data: {
          totalSpent: { increment: invoice.total },
        },
      });

      // Update freelancer profile totalEarned
      await tx.freelancerProfile.update({
        where: { id: invoice.freelancerProfileId },
        data: {
          totalEarned: { increment: invoice.total },
        },
      });

      // Create notification for freelancer
      const freelancerUser = await tx.freelancerProfile.findUnique({
        where: { id: invoice.freelancerProfileId },
        select: { userId: true },
      });

      if (freelancerUser) {
        await tx.notification.create({
          data: {
            userId: freelancerUser.userId,
            title: 'Payment Cleared',
            message: `Payment of $${Number(invoice.total).toLocaleString()} for invoice ${invoice.invoiceNumber} has settled.`,
            type: 'PAYMENT',
            link: `/freelancer/contracts/${invoice.contractId}`,
          },
        });
      }

      return payment;
    });
  }

  static async getPaymentHistory(userId) {
    return prisma.payment.findMany({
      where: {
        OR: [
          { contract: { client: { userId } } },
          { contract: { freelancerProfile: { userId } } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        invoice: { select: { invoiceNumber: true, status: true } },
        contract: { select: { id: true, project: { select: { id: true, title: true } } } },
      },
    });
  }
}
