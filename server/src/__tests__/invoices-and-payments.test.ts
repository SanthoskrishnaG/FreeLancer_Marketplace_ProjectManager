import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { signAccessToken } from '../utils/jwt.util.js';
import { ProfileRepository } from '../repositories/profile.repository.js';
import { ContractRepository } from '../repositories/contract.repository.js';
import { InvoiceRepository } from '../repositories/invoice.repository.js';
import { PaymentRepository } from '../repositories/payment.repository.js';
import { prisma } from '../config/database.js';
import { UserRole, ContractStatus, InvoiceStatus, PaymentStatus, MilestoneStatus } from '@prisma/client';

describe('Invoicing & Payment Workflow Suite', () => {
  const app = createApp();

  const clientUserId = 'client-inv-111';
  const clientProfileId = 'client-profile-111';
  const freelancerUserId = 'freelancer-inv-222';
  const freelancerProfileId = 'freelancer-profile-222';

  const contractId = '00000000-0000-0000-0000-000000000001';
  const milestoneId = '00000000-0000-0000-0000-000000000002';
  const invoiceId = '00000000-0000-0000-0000-000000000003';

  const clientToken = signAccessToken({
    userId: clientUserId,
    email: 'client.invoicing@market.io',
    role: UserRole.CLIENT,
  });

  const freelancerToken = signAccessToken({
    userId: freelancerUserId,
    email: 'freelancer.invoicing@market.io',
    role: UserRole.FREELANCER,
  });

  const mockClientUser = {
    id: clientUserId,
    email: 'client.invoicing@market.io',
    firstName: 'Alice',
    lastName: 'Client',
    role: UserRole.CLIENT,
    clientProfile: { id: clientProfileId },
    freelancerProfile: null,
  };

  const mockFreelancerUser = {
    id: freelancerUserId,
    email: 'freelancer.invoicing@market.io',
    firstName: 'Bob',
    lastName: 'Freelancer',
    role: UserRole.FREELANCER,
    freelancerProfile: { id: freelancerProfileId },
    clientProfile: null,
  };

  const mockContract = {
    id: contractId,
    projectId: 'proj-inv-1',
    clientId: clientProfileId,
    freelancerProfileId,
    totalAmount: 2500,
    status: ContractStatus.COMPLETED,
    project: {
      id: 'proj-inv-1',
      title: 'Enterprise Billing Microservice',
    },
    client: {
      id: clientProfileId,
      companyName: 'Acme Global',
      userId: clientUserId,
      user: {
        id: clientUserId,
        firstName: 'Alice',
        lastName: 'Client',
        email: 'client.invoicing@market.io',
        location: 'New York, USA',
      },
    },
    freelancerProfile: {
      id: freelancerProfileId,
      title: 'Senior Backend Architect',
      userId: freelancerUserId,
      user: {
        id: freelancerUserId,
        firstName: 'Bob',
        lastName: 'Freelancer',
        email: 'freelancer.invoicing@market.io',
        location: 'London, UK',
      },
    },
    milestones: [
      {
        id: milestoneId,
        title: 'Phase 1: Architecture Specification',
        amount: 2500,
        status: MilestoneStatus.APPROVED,
      },
    ],
  };

  const mockInvoice = {
    id: invoiceId,
    invoiceNumber: 'INV-2026-98765',
    clientId: clientProfileId,
    freelancerProfileId,
    projectId: 'proj-inv-1',
    contractId,
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 14 * 86400000),
    subtotal: 2500,
    tax: 0,
    total: 2500,
    status: InvoiceStatus.ISSUED,
    paidAt: null,
    items: [
      {
        id: 'item-1',
        invoiceId,
        milestoneId,
        description: 'Phase 1: Architecture Specification',
        amount: 2500,
        order: 1,
      },
    ],
    client: mockContract.client,
    freelancerProfile: mockContract.freelancerProfile,
    project: mockContract.project,
    contract: mockContract,
    payments: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Invoice Generation & PDF Export', () => {
    it('POST /api/invoices should generate invoice based on completed contract milestones', async () => {
      vi.spyOn(ProfileRepository, 'getUserFullProfile').mockResolvedValue(mockClientUser as any);
      vi.spyOn(ContractRepository, 'findContractById').mockResolvedValue(mockContract as any);
      vi.spyOn(InvoiceRepository, 'createInvoice').mockResolvedValue(mockInvoice as any);

      const res = await request(app)
        .post('/api/invoices')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          contractId,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.invoiceNumber).toBe('INV-2026-98765');
      expect(res.body.data.subtotal).toBe(2500);
      expect(res.body.data.status).toBe(InvoiceStatus.ISSUED);
    });

    it('GET /api/invoices should return invoices list for authenticated client', async () => {
      vi.spyOn(ProfileRepository, 'getUserFullProfile').mockResolvedValue(mockClientUser as any);
      vi.spyOn(InvoiceRepository, 'getUserInvoices').mockResolvedValue({
        invoices: [mockInvoice] as any,
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
      });

      const res = await request(app)
        .get('/api/invoices')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.invoices).toHaveLength(1);
      expect(res.body.data.invoices[0].invoiceNumber).toBe('INV-2026-98765');
    });

    it('GET /api/invoices/:id/pdf should stream a valid application/pdf buffer', async () => {
      vi.spyOn(ProfileRepository, 'getUserFullProfile').mockResolvedValue(mockClientUser as any);
      vi.spyOn(InvoiceRepository, 'findInvoiceById').mockResolvedValue(mockInvoice as any);

      const res = await request(app)
        .get(`/api/invoices/${invoiceId}/pdf`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/pdf');
      expect(res.headers['content-disposition']).toContain(`attachment; filename="Invoice-INV-2026-98765.pdf"`);
      expect(res.body.length).toBeGreaterThan(500); // Binary PDF content
    });
  });

  describe('Payment Processing & Gateway Abstraction', () => {
    it('POST /api/payments/checkout should process payment with Mock Provider and mark invoice PAID', async () => {
      vi.spyOn(ProfileRepository, 'getUserFullProfile').mockResolvedValue(mockClientUser as any);
      vi.spyOn(InvoiceRepository, 'findInvoiceById').mockResolvedValue(mockInvoice as any);

      vi.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        const txMock = {
          payment: {
            create: vi.fn().mockResolvedValue({
              id: 'payment-uuid-1',
              invoiceId,
              contractId,
              amount: 2500,
              currency: 'USD',
              provider: 'MOCK',
              transactionId: 'txn_mock_test_12345',
              status: PaymentStatus.COMPLETED,
            }),
          },
          invoice: {
            update: vi.fn().mockResolvedValue({ ...mockInvoice, status: InvoiceStatus.PAID }),
          },
          clientProfile: {
            update: vi.fn().mockResolvedValue({ id: clientProfileId }),
          },
          freelancerProfile: {
            update: vi.fn().mockResolvedValue({ id: freelancerProfileId }),
          },
          notification: {
            create: vi.fn().mockResolvedValue({ id: 'notif-1' }),
          },
        };
        return callback(txMock);
      });

      const res = await request(app)
        .post('/api/payments/checkout')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          invoiceId,
          provider: 'MOCK',
          paymentMethod: 'mock_card',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(PaymentStatus.COMPLETED);
      expect(res.body.data.payment.provider).toBe('MOCK');
      expect(res.body.data.payment.transactionId).toBeDefined();

      // Zero card storage verification: verify no sensitive card attributes exist
      expect(res.body.data.payment.cardNumber).toBeUndefined();
      expect(res.body.data.payment.cvv).toBeUndefined();
    });

    it('POST /api/payments/checkout should reject duplicate payment when invoice is already PAID', async () => {
      vi.spyOn(ProfileRepository, 'getUserFullProfile').mockResolvedValue(mockClientUser as any);
      vi.spyOn(InvoiceRepository, 'findInvoiceById').mockResolvedValue({
        ...mockInvoice,
        status: InvoiceStatus.PAID,
      } as any);

      const res = await request(app)
        .post('/api/payments/checkout')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          invoiceId,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already been paid');
    });

    it('GET /api/payments/history should return payment ledger', async () => {
      vi.spyOn(ProfileRepository, 'getUserFullProfile').mockResolvedValue(mockClientUser as any);
      vi.spyOn(PaymentRepository, 'getUserPayments').mockResolvedValue({
        payments: [
          {
            id: 'payment-1',
            invoiceId,
            contractId,
            amount: 2500,
            currency: 'USD',
            provider: 'MOCK',
            transactionId: 'txn_mock_111',
            status: PaymentStatus.COMPLETED,
            createdAt: new Date(),
          },
        ] as any,
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
      });

      const res = await request(app)
        .get('/api/payments/history')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.payments).toHaveLength(1);
      expect(res.body.data.payments[0].provider).toBe('MOCK');
    });
  });
});
