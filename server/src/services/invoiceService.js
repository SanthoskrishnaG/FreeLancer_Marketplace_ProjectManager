import { InvoiceRepository } from '../repositories/invoice.repository.js';
import { ContractRepository } from '../repositories/contract.repository.js';
import { ProfileRepository } from '../repositories/profile.repository.js';
import { InvoicePdfService } from './invoice-pdf.service.js';
import { ApiError } from '../utils/api-error.js';

export class InvoiceService {
  static async createInvoice(userId, input) {
    return this.generateInvoice(userId, input);
  }

  static async generateInvoice(userId, input) {
    const { contractId, dueDate, tax = 0 } = input;

    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user) throw ApiError.unauthorized('Authentication required');

    const contract = await ContractRepository.findContractById(contractId);
    if (!contract) throw ApiError.notFound('Contract not found');

    const isClient = user.clientProfile && contract.clientId === user.clientProfile.id;
    const isFreelancer =
      user.freelancerProfile && contract.freelancerProfileId === user.freelancerProfile.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isClient && !isFreelancer && !isAdmin) {
      throw ApiError.forbidden('You do not have authorization to generate invoices for this contract');
    }

    const eligibleMilestones = (contract.milestones || []).filter(
      (m) => m.status === 'APPROVED' || m.status === 'COMPLETED' || contract.status === 'COMPLETED'
    );

    const milestonesToInvoice =
      eligibleMilestones.length > 0 ? eligibleMilestones : (contract.milestones || []);

    let subtotal = 0;
    const items = [];

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
      const totalAmt = Number(contract.totalAmount || 0);
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
      status: 'ISSUED',
      items,
    });
  }

  static async getUserInvoices(userId, query = {}) {
    return this.getInvoices(userId, query);
  }

  static async getInvoices(userId, query = {}) {
    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user) throw ApiError.unauthorized('Authentication required');

    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);

    const filter = {
      contractId: query.contractId,
      status: query.status,
      page,
      limit,
    };

    if (user.role === 'CLIENT' && user.clientProfile) {
      filter.clientId = user.clientProfile.id;
    } else if (user.role === 'FREELANCER' && user.freelancerProfile) {
      filter.freelancerProfileId = user.freelancerProfile.id;
    }

    return InvoiceRepository.getUserInvoices(filter);
  }

  static async getInvoiceById(arg1, arg2) {
    let invoiceId = typeof arg1 === 'string' && arg1.length === 36 ? arg1 : arg2;
    let userId = invoiceId === arg1 ? arg2 : arg1;

    const invoice = await InvoiceRepository.findInvoiceById(invoiceId);
    if (!invoice) throw ApiError.notFound('Invoice not found');

    if (userId) {
      const user = await ProfileRepository.getUserFullProfile(userId);
      if (user) {
        const isClient = user.clientProfile && invoice.clientId === user.clientProfile.id;
        const isFreelancer =
          user.freelancerProfile && invoice.freelancerProfileId === user.freelancerProfile.id;
        const isAdmin = user.role === 'ADMIN';

        if (!isClient && !isFreelancer && !isAdmin) {
          throw ApiError.forbidden('You do not have permission to view this invoice');
        }
      }
    }

    return invoice;
  }

  static async generateInvoicePdf(invoiceId, userId) {
    const invoice = await this.getInvoiceById(invoiceId, userId);
    return InvoicePdfService.generatePdfBuffer(invoice);
  }
}

export default InvoiceService;
