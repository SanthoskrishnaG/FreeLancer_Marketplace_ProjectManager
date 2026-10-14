import { prisma } from '../config/database.js';

export class PaymentRepository {
  static async createPayment(data) {
    return prisma.payment.create({
      data,
      include: {
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            total: true,
          },
        },
        contract: {
          select: {
            id: true,
            projectId: true,
            project: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });
  }

  static async findPaymentById(id) {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        invoice: true,
        contract: true,
      },
    });
  }

  static async findPaymentByTransactionId(transactionId) {
    return prisma.payment.findUnique({
      where: { transactionId },
    });
  }

  static async getUserPayments(filter) {
    const { clientId, freelancerProfileId, contractId, status, page = 1, limit = 10 } = filter;
    const where = {};
    if (status) where.status = status;
    if (contractId) where.contractId = contractId;

    if (clientId) {
      where.contract = { clientId };
    } else if (freelancerProfileId) {
      where.contract = { freelancerProfileId };
    }

    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
              total: true,
              status: true,
            },
          },
          contract: {
            select: {
              id: true,
              project: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return {
      payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}

export default PaymentRepository;
