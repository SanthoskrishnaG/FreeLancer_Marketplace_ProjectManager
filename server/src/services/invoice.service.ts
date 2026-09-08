import { InvoiceRepository } from '../repositories/invoice.repository.js';
import { ContractRepository } from '../repositories/contract.repository.js';
import { ProfileRepository } from '../repositories/profile.repository.js';
import { InvoicePdfService } from './invoice-pdf.service.js';
import { ApiError } from '../utils/api-error.js';
import { CreateInvoiceInput } from '../validators/invoice.validator.js';
import { InvoiceStatus, UserRole, MilestoneStatus } from '@prisma/client';

export class InvoiceService {
  public static async generateInvoice(userId: string, input: CreateInvoiceInput) {
    const { contractId, dueDate, tax = 0 } = input;

    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user) throw ApiError.unauthorized('Authentication required');

    const contract = await ContractRepository.findContractById(contractId);
    if (!contract) throw ApiError.notFound('Contract not found');

    const isClient = user.clientProfile && contract.clientId === user.clientProfile.id;
    const isFreelancer =
      user.freelancerProfile && contract.freelancerProfileId === user.freelancerProfile.id;
    const isAdmin = user.role === UserRole.ADMIN;

    if (!isClient && !isFreelancer && !isAdmin) {
      throw ApiError.forbidden('You do not have authorization to generate invoices for this contract');
    }

    // Determine milestones to invoice. If milestones are approved or completed, use them.
    // If none are explicitly marked completed, but contract is active/completed, include pending/in-progress as line items or the full contract value.
    const eligibleMilestones = contract.milestones.filter(
      (m) =>
        m.status === MilestoneStatus.APPROVED ||
        m.status === MilestoneStatus.COMPLETED ||
        contract.status === 'COMPLETED'
    );

    // If no specific approved milestones yet, invoice all milestones on the contract
    const milestonesToInvoice =
      eligibleMilestones.length > 0 ? eligibleMilestones : contract.milestones;

    let subtotal = 0;
    const items: Array<{
      milestoneId?: string | null;
      description: string;
      amount: number;
      order: number;
    }> = [];

    if (milestonesToInvoice.length > 0) {
      milestonesToInvoice.forEach((m, idx) => {
        const amt = Number(m.amount);
        subtotal += amt;
        items.push({
          milestoneId: m.id,
          description: m.title || `Milestone Deliverable #${idx + 1}`,
          amount: amt,
          order: idx + 1,
        });
      });
    } else {
      // Fallback to full contract total amount
      const totalAmt = Number(contract.totalAmount);
      subtotal = totalAmt;
      items.push({
        milestoneId: null,
        description: `Contract Services Delivery: ${contract.project?.title || 'Deliverables'}`,
        amount: totalAmt,
        order: 1,
      });
    }

    const calculatedTax = Math.round(Number(tax) * 100) / 100;
    const total = Math.round((subtotal + calculatedTax) * 100) / 100;

    // Generate unique invoice number: INV-YEAR-RANDOM
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const invoiceNumber = `INV-${year}-${randomSuffix}`;

    const calculatedDueDate = dueDate
      ? new Date(dueDate)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    return InvoiceRepository.createInvoice({
      invoiceNumber,
      clientId: contract.clientId,
      freelancerProfileId: contract.freelancerProfileId,
      projectId: contract.projectId,
      contractId: contract.id,
      milestoneId: milestonesToInvoice[0]?.id || null,
      issueDate: new Date(),
      dueDate: calculatedDueDate,
      subtotal,
      tax: calculatedTax,
      total,
      status: InvoiceStatus.ISSUED,
      items,
    });
  }

  public static async getInvoices(
    userId: string,
    query: {
      contractId?: string;
      status?: InvoiceStatus;
      page?: string;
      limit?: string;
    }
  ) {
    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user) throw ApiError.unauthorized('Authentication required');

    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);

    if (user.role === UserRole.CLIENT && user.clientProfile) {
      return InvoiceRepository.getUserInvoices({
        clientId: user.clientProfile.id,
        contractId: query.contractId,
        status: query.status,
        page,
        limit,
      });
    }

    if (user.role === UserRole.FREELANCER && user.freelancerProfile) {
      return InvoiceRepository.getUserInvoices({
        freelancerProfileId: user.freelancerProfile.id,
        contractId: query.contractId,
        status: query.status,
        page,
        limit,
      });
    }

    if (user.role === UserRole.ADMIN) {
      return InvoiceRepository.getUserInvoices({
        contractId: query.contractId,
        status: query.status,
        page,
        limit,
      });
    }

    return {
      invoices: [],
      pagination: { total: 0, page: 1, limit, totalPages: 0 },
    };
  }

  public static async getInvoiceById(userId: string, invoiceId: string) {
    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user) throw ApiError.unauthorized('Authentication required');

    const invoice = await InvoiceRepository.findInvoiceById(invoiceId);
    if (!invoice) throw ApiError.notFound('Invoice not found');

    const isClient = user.clientProfile && invoice.clientId === user.clientProfile.id;
    const isFreelancer =
      user.freelancerProfile && invoice.freelancerProfileId === user.freelancerProfile.id;
    const isAdmin = user.role === UserRole.ADMIN;

    if (!isClient && !isFreelancer && !isAdmin) {
      throw ApiError.forbidden('You do not have permission to view this invoice');
    }

    return invoice;
  }

  public static async getInvoicePdf(userId: string, invoiceId: string): Promise<{
    buffer: Buffer;
    fileName: string;
  }> {
    const invoice = await this.getInvoiceById(userId, invoiceId);

    const clientName = invoice.client.user
      ? `${invoice.client.user.firstName} ${invoice.client.user.lastName}`
      : 'Client Party';

    const freelancerName = invoice.freelancerProfile.user
      ? `${invoice.freelancerProfile.user.firstName} ${invoice.freelancerProfile.user.lastName}`
      : 'Freelancer Party';

    const buffer = await InvoicePdfService.generateInvoicePdf({
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      status: invoice.status,
      subtotal: invoice.subtotal.toString(),
      tax: invoice.tax.toString(),
      total: invoice.total.toString(),
      paidAt: invoice.paidAt,
      client: {
        name: clientName,
        companyName: invoice.client.companyName,
        email: invoice.client.user?.email || '',
        location: invoice.client.user?.location || null,
      },
      freelancer: {
        name: freelancerName,
        title: invoice.freelancerProfile.title,
        email: invoice.freelancerProfile.user?.email || '',
        location: invoice.freelancerProfile.user?.location || null,
      },
      project: {
        title: invoice.project.title,
      },
      contractId: invoice.contractId,
      items: invoice.items.map((i) => ({
        description: i.description,
        amount: i.amount.toString(),
      })),
      payments: invoice.payments.map((p) => ({
        transactionId: p.transactionId,
        provider: p.provider,
        amount: p.amount.toString(),
        createdAt: p.createdAt,
      })),
    });

    return {
      buffer,
      fileName: `Invoice-${invoice.invoiceNumber}.pdf`,
    };
  }

  public static async getFinancialMetrics(userId: string) {
    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user) throw ApiError.unauthorized('Authentication required');

    if (user.role === UserRole.CLIENT && user.clientProfile) {
      return InvoiceRepository.getFinancialMetrics({
        clientId: user.clientProfile.id,
      });
    }

    if (user.role === UserRole.FREELANCER && user.freelancerProfile) {
      return InvoiceRepository.getFinancialMetrics({
        freelancerProfileId: user.freelancerProfile.id,
      });
    }

    if (user.role === UserRole.ADMIN) {
      return InvoiceRepository.getFinancialMetrics({});
    }

    return {
      totalInvoices: 0,
      paidCount: 0,
      pendingCount: 0,
      totalPaid: 0,
      totalPending: 0,
      totalOverdue: 0,
    };
  }
}
