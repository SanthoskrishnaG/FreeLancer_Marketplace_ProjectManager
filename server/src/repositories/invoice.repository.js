import { prisma } from '../config/database.js';

export class InvoiceRepository {
  static async createInvoice(data) {
    const { items = [], ...invoiceData } = data;

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

  static async findInvoiceById(id) {
    return prisma.invoice.findUnique({
      where: { id },
      include: {
        items: { orderBy: { order: 'asc' } },
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
        project: { select: { id: true, title: true } },
        contract: true,
        payments: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  static async findInvoiceByNumber(invoiceNumber) {
    return prisma.invoice.findUnique({
      where: { invoiceNumber },
    });
  }

  static async getUserInvoices(filter) {
    const { clientId, freelancerProfileId, contractId, status, page = 1, limit = 10 } = filter;
    const where = {};
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
          client: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true, email: true },
              },
            },
          },
          freelancerProfile: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true, email: true },
              },
            },
          },
          project: { select: { id: true, title: true } },
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
}

export default InvoiceRepository;
