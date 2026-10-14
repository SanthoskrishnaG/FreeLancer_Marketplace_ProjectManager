import { PaymentRepository } from '../repositories/payment.repository.js';
import { InvoiceRepository } from '../repositories/invoice.repository.js';
import { ProfileRepository } from '../repositories/profile.repository.js';
import { prisma } from '../config/database.js';
import { ApiError } from '../utils/api-error.js';

export class PaymentService {
  static async processPayment(userId, input) {
    const { invoiceId, provider = 'MOCK', currency = 'INR' } = input;

    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user) throw ApiError.unauthorized('Authentication required');

    const invoice = await InvoiceRepository.findInvoiceById(invoiceId);
    if (!invoice) throw ApiError.notFound('Invoice not found');

    const isClient = user.clientProfile && invoice.clientId === user.clientProfile.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isClient && !isAdmin) {
      throw ApiError.forbidden('Only the assigned client or an administrator can pay this invoice');
    }

    if (invoice.status === 'PAID') {
      throw ApiError.badRequest('Invoice has already been paid in full');
    }

    if (invoice.status === 'CANCELLED') {
      throw ApiError.badRequest('Cannot pay a cancelled invoice');
    }

    const transactionId = `txn_${provider.toLowerCase()}_${Date.now()}`;

    const payment = await prisma.$transaction(async (tx) => {
      const p = await tx.payment.create({
        data: {
          invoiceId: invoice.id,
          contractId: invoice.contractId,
          amount: invoice.total,
          currency,
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

      return p;
    });

    return {
      ...payment,
      status: 'COMPLETED',
    };
  }

  static async getUserPayments(userId, role, query = {}) {
    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user) throw ApiError.unauthorized('Authentication required');

    const page = parseInt(query?.page || '1', 10);
    const limit = parseInt(query?.limit || '10', 10);

    const filter = {
      page,
      limit,
    };

    if (user.role === 'CLIENT' && user.clientProfile) {
      filter.clientId = user.clientProfile.id;
    } else if (user.role === 'FREELANCER' && user.freelancerProfile) {
      filter.freelancerProfileId = user.freelancerProfile.id;
    }

    return PaymentRepository.getUserPayments(filter);
  }

  static async createPaymentOrder(userId, data) {
    return {
      orderId: `order_${Date.now()}`,
      amount: data.amount,
      currency: data.currency || 'INR',
    };
  }

  static async verifyPayment(data) {
    return {
      success: true,
      transactionId: data.paymentId || `txn_${Date.now()}`,
      status: 'SUCCESS',
    };
  }

  static async releaseEscrow(escrowId, userId) {
    return {
      success: true,
      escrowId,
      status: 'RELEASED',
    };
  }
}

export default PaymentService;
