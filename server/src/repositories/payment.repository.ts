import { prisma } from '../config/database.js';
import { PaymentStatus, Prisma } from '@prisma/client';

export class PaymentRepository {
  public static async createPayment(data: {
    invoiceId: string;
    contractId: string;
    amount: Prisma.Decimal | number;
    currency: string;
    provider: string;
    transactionId: string;
    status: PaymentStatus;
    metadata?: Prisma.InputJsonValue;
  }) {
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

  public static async findPaymentById(id: string) {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        invoice: true,
        contract: true,
      },
    });
  }

  public static async findPaymentByTransactionId(transactionId: string) {
    return prisma.payment.findUnique({
      where: { transactionId },
    });
  }

  public static async getUserPayments(filter: {
    clientId?: string;
    freelancerProfileId?: string;
    contractId?: string;
    invoiceId?: string;
    page: number;
    limit: number;
  }) {
    const { clientId, freelancerProfileId, contractId, invoiceId, page, limit } = filter;

    const where: Prisma.PaymentWhereInput = {};
    if (invoiceId) where.invoiceId = invoiceId;
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
              status: true,
              total: true,
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
              client: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
              freelancerProfile: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
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
