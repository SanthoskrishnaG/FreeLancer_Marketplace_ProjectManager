import { prisma } from '../config/database.js';
import { InvoiceStatus, Prisma } from '@prisma/client';

export class InvoiceRepository {
  public static async createInvoice(data: {
    invoiceNumber: string;
    clientId: string;
    freelancerProfileId: string;
    projectId: string;
    contractId: string;
    milestoneId?: string | null;
    issueDate: Date;
    dueDate: Date;
    subtotal: Prisma.Decimal | number;
    tax: Prisma.Decimal | number;
    total: Prisma.Decimal | number;
    status: InvoiceStatus;
    items: Array<{
      milestoneId?: string | null;
      description: string;
      amount: Prisma.Decimal | number;
      order: number;
    }>;
  }) {
    const { items, ...invoiceData } = data;

    return prisma.invoice.create({
      data: {
        ...invoiceData,
        items: {
          create: items,
        },
      },
      include: {
        items: true,
        client: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                location: true,
              },
            },
          },
        },
        freelancerProfile: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                location: true,
              },
            },
          },
        },
        project: {
          select: {
            id: true,
            title: true,
          },
        },
        contract: true,
        payments: true,
      },
    });
  }

  public static async findInvoiceById(id: string) {
    return prisma.invoice.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
        client: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                location: true,
              },
            },
          },
        },
        freelancerProfile: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                location: true,
              },
            },
          },
        },
        project: {
          select: {
            id: true,
            title: true,
          },
        },
        contract: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  public static async findInvoiceByNumber(invoiceNumber: string) {
    return prisma.invoice.findUnique({
      where: { invoiceNumber },
    });
  }

  public static async getUserInvoices(filter: {
    clientId?: string;
    freelancerProfileId?: string;
    contractId?: string;
    status?: InvoiceStatus;
    page: number;
    limit: number;
  }) {
    const { clientId, freelancerProfileId, contractId, status, page, limit } = filter;

    const where: Prisma.InvoiceWhereInput = {};
    if (clientId) where.clientId = clientId;
    if (freelancerProfileId) where.freelancerProfileId = freelancerProfileId;
    if (contractId) where.contractId = contractId;
    if (status) where.status = status;

    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          project: {
            select: { id: true, title: true },
          },
          client: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true },
              },
            },
          },
          freelancerProfile: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true },
              },
            },
          },
          payments: true,
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    return {
      invoices,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  public static async updateInvoiceStatus(
    id: string,
    status: InvoiceStatus,
    paidAt?: Date | null
  ) {
    return prisma.invoice.update({
      where: { id },
      data: {
        status,
        ...(paidAt !== undefined ? { paidAt } : {}),
      },
      include: {
        items: true,
        payments: true,
      },
    });
  }

  public static async getFinancialMetrics(params: {
    clientId?: string;
    freelancerProfileId?: string;
  }) {
    const { clientId, freelancerProfileId } = params;
    const where: Prisma.InvoiceWhereInput = {};
    if (clientId) where.clientId = clientId;
    if (freelancerProfileId) where.freelancerProfileId = freelancerProfileId;

    const allInvoices = await prisma.invoice.findMany({
      where,
      select: {
        status: true,
        total: true,
      },
    });

    let totalPaid = 0;
    let totalPending = 0;
    let totalOverdue = 0;
    let paidCount = 0;
    let pendingCount = 0;

    for (const inv of allInvoices) {
      const val = Number(inv.total);
      if (inv.status === InvoiceStatus.PAID) {
        totalPaid += val;
        paidCount++;
      } else if (inv.status === InvoiceStatus.ISSUED || inv.status === InvoiceStatus.DRAFT) {
        totalPending += val;
        pendingCount++;
      } else if (inv.status === InvoiceStatus.OVERDUE) {
        totalOverdue += val;
      }
    }

    return {
      totalInvoices: allInvoices.length,
      paidCount,
      pendingCount,
      totalPaid,
      totalPending,
      totalOverdue,
    };
  }
}
