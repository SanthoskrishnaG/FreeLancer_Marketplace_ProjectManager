import { PaymentRepository } from '../repositories/payment.repository.js';
import { InvoiceRepository } from '../repositories/invoice.repository.js';
import { ProfileRepository } from '../repositories/profile.repository.js';
import { prisma } from '../config/database.js';
import { PaymentProviderFactory } from './payment/payment-provider.factory.js';
import { ApiError } from '../utils/api-error.js';
import { ProcessPaymentInput, PaymentQueryInput } from '../validators/payment.validator.js';
import { InvoiceStatus, PaymentStatus, UserRole, NotificationType } from '@prisma/client';

export class PaymentService {
  public static async processPayment(userId: string, input: ProcessPaymentInput) {
    const { invoiceId, provider: providerName = 'MOCK', paymentMethod = 'mock_card', currency = 'USD' } = input;

    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user) throw ApiError.unauthorized('Authentication required');

    const invoice = await InvoiceRepository.findInvoiceById(invoiceId);
    if (!invoice) throw ApiError.notFound('Invoice not found');

    const isClient = user.clientProfile && invoice.clientId === user.clientProfile.id;
    const isAdmin = user.role === UserRole.ADMIN;

    if (!isClient && !isAdmin) {
      throw ApiError.forbidden('Only the assigned client or an administrator can pay this invoice');
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw ApiError.badRequest('Invoice has already been paid in full');
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw ApiError.badRequest('Cannot pay a cancelled invoice');
    }

    const provider = PaymentProviderFactory.getProvider(providerName);
    const amountNumber = Number(invoice.total);

    // Process through Payment Provider Abstraction (Zero card data stored!)
    const paymentResult = await provider.processPayment({
      invoiceId: invoice.id,
      amount: amountNumber,
      currency,
      paymentMethod,
      description: `Payment for Invoice #${invoice.invoiceNumber}`,
      metadata: {
        contractId: invoice.contractId,
        clientId: invoice.clientId,
        freelancerProfileId: invoice.freelancerProfileId,
      },
    });

    if (!paymentResult.success) {
      throw ApiError.badRequest(paymentResult.message || 'Payment processing failed with provider');
    }

    // Execute atomic transaction: record payment, mark invoice paid, update financial metrics
    return prisma.$transaction(async (tx) => {
      // 1. Create Payment record
      const payment = await tx.payment.create({
        data: {
          invoiceId: invoice.id,
          contractId: invoice.contractId,
          amount: invoice.total,
          currency,
          provider: paymentResult.provider,
          transactionId: paymentResult.transactionId,
          status: PaymentStatus.COMPLETED,
          metadata: paymentResult.metadata ? JSON.parse(JSON.stringify(paymentResult.metadata)) : undefined,
        },
      });

      // 2. Update Invoice to PAID
      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          status: InvoiceStatus.PAID,
          paidAt: new Date(),
        },
      });

      // 3. Update Client totalSpent
      await tx.clientProfile.update({
        where: { id: invoice.clientId },
        data: {
          totalSpent: {
            increment: invoice.total,
          },
        },
      });

      // 4. Update Freelancer totalEarned
      await tx.freelancerProfile.update({
        where: { id: invoice.freelancerProfileId },
        data: {
          totalEarned: {
            increment: invoice.subtotal, // earnings before platform fee/tax
          },
        },
      });

      // 5. Notify Freelancer
      if (invoice.freelancerProfile.user) {
        await tx.notification.create({
          data: {
            userId: invoice.freelancerProfile.user.id,
            title: 'Payment Received!',
            message: `You received a payment of $${invoice.subtotal} for Invoice #${invoice.invoiceNumber}.`,
            type: NotificationType.PAYMENT,
            link: `/invoices/${invoice.id}`,
          },
        });
      }

      return {
        payment,
        invoiceNumber: invoice.invoiceNumber,
        status: PaymentStatus.COMPLETED,
        message: 'Payment settled and invoice marked as PAID',
      };
    });
  }

  public static async getPaymentHistory(userId: string, query: PaymentQueryInput) {
    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user) throw ApiError.unauthorized('Authentication required');

    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);

    if (user.role === UserRole.CLIENT && user.clientProfile) {
      return PaymentRepository.getUserPayments({
        clientId: user.clientProfile.id,
        invoiceId: query.invoiceId,
        contractId: query.contractId,
        page,
        limit,
      });
    }

    if (user.role === UserRole.FREELANCER && user.freelancerProfile) {
      return PaymentRepository.getUserPayments({
        freelancerProfileId: user.freelancerProfile.id,
        invoiceId: query.invoiceId,
        contractId: query.contractId,
        page,
        limit,
      });
    }

    if (user.role === UserRole.ADMIN) {
      return PaymentRepository.getUserPayments({
        invoiceId: query.invoiceId,
        contractId: query.contractId,
        page,
        limit,
      });
    }

    return {
      payments: [],
      pagination: { total: 0, page: 1, limit, totalPages: 0 },
    };
  }

  public static async getPaymentById(userId: string, paymentId: string) {
    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user) throw ApiError.unauthorized('Authentication required');

    const payment = await PaymentRepository.findPaymentById(paymentId);
    if (!payment) throw ApiError.notFound('Payment record not found');

    const isClient = user.clientProfile && payment.contract.clientId === user.clientProfile.id;
    const isFreelancer =
      user.freelancerProfile &&
      payment.contract.freelancerProfileId === user.freelancerProfile.id;
    const isAdmin = user.role === UserRole.ADMIN;

    if (!isClient && !isFreelancer && !isAdmin) {
      throw ApiError.forbidden('You do not have permission to view this payment receipt');
    }

    return payment;
  }
}
