import { prisma } from '../config/database.js';
import { ApiError } from '../utils/api-error.js';
import { generateInvoicePdf } from '../utils/pdfGenerator.js';

export class InvoiceService {
  static async getInvoices(userId) {
    return prisma.invoice.findMany({
      where: {
        OR: [
          { client: { userId } },
          { freelancerProfile: { userId } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { companyName: true, user: { select: { firstName: true, lastName: true } } } },
        freelancerProfile: { select: { user: { select: { firstName: true, lastName: true } } } },
        project: { select: { id: true, title: true } },
      },
    });
  }

  static async getInvoiceById(userId, invoiceId) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        client: { include: { user: true } },
        freelancerProfile: { include: { user: true } },
        project: true,
        contract: true,
        items: true,
        payments: true,
      },
    });

    if (!invoice) {
      throw ApiError.notFound('Invoice not found');
    }

    const isClient = invoice.client.userId === userId;
    const isFreelancer = invoice.freelancerProfile.userId === userId;

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!isClient && !isFreelancer && user?.role !== 'ADMIN') {
      throw ApiError.forbidden('Unauthorized access to invoice record');
    }

    return invoice;
  }

  static async getInvoicePdf(userId, invoiceId) {
    const invoice = await this.getInvoiceById(userId, invoiceId);
    const pdfBuffer = await generateInvoicePdf(invoice);
    return {
      buffer: pdfBuffer,
      fileName: `Invoice-${invoice.invoiceNumber}.pdf`,
    };
  }
}
