import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../config/database.js';
import { comparePassword } from '../utils/bcrypt.util.js';

describe('WorkPulse AI — PostgreSQL Real Persistence & Security Verification Suite', () => {
  const timestamp = Date.now();
  const testClient = {
    email: `client_persist_${timestamp}@testpulse.com`,
    password: 'SecureClientPass123!',
    name: 'Eleanor Vance',
    role: 'CLIENT',
    companyName: 'Vance Innovations Ltd'
  };

  const testFreelancer = {
    email: `freelancer_persist_${timestamp}@testpulse.com`,
    password: 'SecureFreePass123!',
    name: 'Julian Hayes',
    role: 'FREELANCER',
    title: 'Senior Full Stack Architect',
    hourlyRate: 1500
  };

  const unauthorizedUser = {
    email: `intruder_${timestamp}@testpulse.com`,
    password: 'IntruderPass123!',
    name: 'Intruder Bob',
    role: 'CLIENT',
    companyName: 'Rival Corp'
  };

  let clientToken = '';
  let freelancerToken = '';
  let intruderToken = '';
  let createdProjectId = '';
  let submittedProposalId = '';
  let activeContractId = '';
  let milestoneId = '';
  let createdInvoiceId = '';
  let activeConversationId = '';

  afterAll(async () => {
    // Clean up test-created data gracefully
    try {
      const userEmails = [testClient.email, testFreelancer.email, unauthorizedUser.email];
      const users = await prisma.user.findMany({
        where: { email: { in: userEmails } },
        select: { id: true }
      });
      const userIds = users.map(u => u.id);
      if (userIds.length > 0) {
        await prisma.user.deleteMany({
          where: { id: { in: userIds } }
        });
      }
    } catch (err) {
      console.warn('Post-test cleanup notice:', err.message);
    }
  });

  describe('1. Real User Registration & Password Security', () => {
    it('should register a new client and persist profile in PostgreSQL', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testClient);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testClient.email);
      expect(res.body.data.user.role).toBe('CLIENT');
      expect(res.body.data.user.clientProfile?.companyName).toBe(testClient.companyName);
      expect(res.body.data.user.passwordHash).toBeUndefined(); // Never expose hash in responses
      expect(res.body.data.token || res.body.data.accessToken).toBeTruthy();

      // Verify directly in PostgreSQL
      const dbUser = await prisma.user.findUnique({
        where: { email: testClient.email },
        include: { clientProfile: true }
      });
      expect(dbUser).not.toBeNull();
      expect(dbUser.email).toBe(testClient.email);
      expect(dbUser.clientProfile).not.toBeNull();
      expect(dbUser.clientProfile.companyName).toBe(testClient.companyName);
      
      // Verify password was securely hashed with bcrypt
      expect(dbUser.passwordHash).not.toBe(testClient.password);
      expect(dbUser.passwordHash.startsWith('$2')).toBe(true);
      const isMatch = await comparePassword(testClient.password, dbUser.passwordHash);
      expect(isMatch).toBe(true);
    });

    it('should register a new freelancer and persist profile in PostgreSQL', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testFreelancer);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testFreelancer.email);
      expect(res.body.data.user.role).toBe('FREELANCER');
      expect(res.body.data.user.freelancerProfile?.title).toBe(testFreelancer.title);
      expect(res.body.data.token || res.body.data.accessToken).toBeTruthy();

      // Direct PostgreSQL verification
      const dbFreelancer = await prisma.user.findUnique({
        where: { email: testFreelancer.email },
        include: { freelancerProfile: true }
      });
      expect(dbFreelancer).not.toBeNull();
      expect(Number(dbFreelancer.freelancerProfile.hourlyRate)).toBe(1500);
      expect(dbFreelancer.passwordHash.startsWith('$2')).toBe(true);
    });

    it('should reject duplicate registrations with HTTP 409 Conflict', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testClient);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('should register a third user for unauthorized access validation', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(unauthorizedUser);

      expect(res.status).toBe(201);
      intruderToken = res.body.data.token || res.body.data.accessToken;
    });
  });

  describe('2. Real Database Authentication & Session Tokens', () => {
    it('should authenticate client with correct credentials against PostgreSQL', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testClient.email,
          password: testClient.password
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testClient.email);
      expect(res.body.data.user.role).toBe('CLIENT');
      clientToken = res.body.data.token || res.body.data.accessToken;
      expect(clientToken).toBeTruthy();
    });

    it('should authenticate freelancer with correct credentials against PostgreSQL', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testFreelancer.email,
          password: testFreelancer.password
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testFreelancer.email);
      expect(res.body.data.user.role).toBe('FREELANCER');
      freelancerToken = res.body.data.token || res.body.data.accessToken;
      expect(freelancerToken).toBeTruthy();
    });

    it('should reject login with wrong password (HTTP 401)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testClient.email,
          password: 'IncorrectPassword999!'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should enforce role-based access control (Freelancer cannot access Client dashboard)', async () => {
      const res = await request(app)
        .get('/api/dashboard/client')
        .set('Authorization', `Bearer ${freelancerToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('3. Real Project Creation & PostgreSQL Persistence', () => {
    it('should persist a new client project and its milestones in PostgreSQL', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          title: 'Automated AI Core Engine Integration',
          description: 'Comprehensive PostgreSQL backend with verified authentication and milestone tracking system.',
          budget: 75000,
          budgetType: 'FIXED',
          experienceLevel: 'EXPERT',
          milestones: [
            {
              title: 'Phase 1: DB Schema & Auth Migration',
              description: 'Deliver robust schema and test suites',
              amount: 35000,
              order: 1
            },
            {
              title: 'Phase 2: Full Integration Testing',
              description: 'Deliver zero-mock complete workflow validation',
              amount: 40000,
              order: 2
            }
          ]
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      createdProjectId = res.body.data.id;
      expect(createdProjectId).toBeTruthy();

      // Read back directly from PostgreSQL
      const dbProject = await prisma.project.findUnique({
        where: { id: createdProjectId },
        include: { milestones: true, client: true }
      });

      expect(dbProject).not.toBeNull();
      expect(dbProject.title).toBe('Automated AI Core Engine Integration');
      expect(Number(dbProject.budget)).toBe(75000);
      expect(dbProject.status).toBe('PUBLISHED');
      expect(dbProject.milestones.length).toBe(2);
      expect(Number(dbProject.milestones[0].amount)).toBe(35000);
    });

    it('should update project details in PostgreSQL', async () => {
      const res = await request(app)
        .put(`/api/projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          title: 'Automated AI Core Engine Integration — Enhanced'
        });

      expect(res.status).toBe(200);

      const dbProject = await prisma.project.findUnique({
        where: { id: createdProjectId }
      });
      expect(dbProject.title).toBe('Automated AI Core Engine Integration — Enhanced');
    });

    it('should prevent unauthorized users from editing another client’s project', async () => {
      const res = await request(app)
        .put(`/api/projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${intruderToken}`)
        .send({
          title: 'Malicious Overwrite Attempt'
        });

      expect(res.status).toBe(403);
    });
  });

  describe('4. Proposal Submission & Contract Lifecycle Persistence', () => {
    it('should allow freelancer to submit proposal backed by PostgreSQL', async () => {
      const res = await request(app)
        .post(`/api/projects/${createdProjectId}/proposals`)
        .set('Authorization', `Bearer ${freelancerToken}`)
        .send({
          projectId: createdProjectId,
          coverLetter: 'I have extensive PostgreSQL, Prisma, and Express full-stack experience to deliver this project.',
          bidAmount: 70000,
          estimatedDuration: '3 weeks',
          milestonePricing: [
            { title: 'Core Implementation', amount: 35000, duration: '1.5 weeks' },
            { title: 'Verification & QA', amount: 35000, duration: '1.5 weeks' }
          ]
        });

      expect(res.status).toBe(201);
      submittedProposalId = res.body.data.id;
      expect(submittedProposalId).toBeTruthy();

      // Confirm in PostgreSQL
      const dbProposal = await prisma.proposal.findUnique({
        where: { id: submittedProposalId }
      });
      expect(dbProposal).not.toBeNull();
      expect(dbProposal.status).toBe('PENDING');
      expect(Number(dbProposal.bidAmount)).toBe(70000);
    });

    it('should allow project owner client to accept proposal, creating Contract & Milestones in PostgreSQL', async () => {
      const res = await request(app)
        .post(`/api/proposals/${submittedProposalId}/accept`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(200);

      // Verify in PostgreSQL transaction
      const dbProposal = await prisma.proposal.findUnique({
        where: { id: submittedProposalId }
      });
      expect(dbProposal.status).toBe('ACCEPTED');

      const dbProject = await prisma.project.findUnique({
        where: { id: createdProjectId }
      });
      expect(dbProject.status).toBe('IN_PROGRESS');

      const dbContract = await prisma.contract.findFirst({
        where: { projectId: createdProjectId },
        include: { milestones: true }
      });
      expect(dbContract).not.toBeNull();
      expect(dbContract.status).toBe('ACTIVE');
      expect(Number(dbContract.totalAmount)).toBe(70000);
      expect(dbContract.milestones.length).toBeGreaterThanOrEqual(1);

      activeContractId = dbContract.id;
      milestoneId = dbContract.milestones[0].id;
    });

    it('should submit milestone deliverables and persist in PostgreSQL', async () => {
      const res = await request(app)
        .post(`/api/milestones/${milestoneId}/submit`)
        .set('Authorization', `Bearer ${freelancerToken}`)
        .send({
          description: 'Phase 1 completed: All database models, security rules, and test suites are deployed.',
          links: ['https://github.com/testpulse/repo/pull/1']
        });

      expect([200, 201]).toContain(res.status);

      const dbMilestone = await prisma.milestone.findUnique({
        where: { id: milestoneId },
        include: { submissions: true }
      });
      expect(dbMilestone.status).toBe('SUBMITTED');
      expect(dbMilestone.submissions.length).toBeGreaterThanOrEqual(1);
    });

    it('should allow project owner client to approve milestone', async () => {
      const res = await request(app)
        .post(`/api/milestones/${milestoneId}/approve`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(200);

      const dbMilestone = await prisma.milestone.findUnique({
        where: { id: milestoneId }
      });
      expect(dbMilestone.status).toBe('APPROVED');
    });
  });

  describe('5. Persistent Invoices & Verified Payments', () => {
    it('should generate a persistent invoice linked to the contract in PostgreSQL', async () => {
      const res = await request(app)
        .post('/api/invoices')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          contractId: activeContractId,
          dueDate: new Date(Date.now() + 864000000).toISOString()
        });

      expect(res.status).toBe(201);
      createdInvoiceId = res.body.data.id;
      expect(createdInvoiceId).toBeTruthy();

      // Verify in PostgreSQL
      const dbInvoice = await prisma.invoice.findUnique({
        where: { id: createdInvoiceId },
        include: { items: true }
      });
      expect(dbInvoice).not.toBeNull();
      expect(dbInvoice.contractId).toBe(activeContractId);
      expect(Number(dbInvoice.total)).toBeGreaterThan(0);
    });

    it('should process payment transaction and persist SUCCESS in PostgreSQL', async () => {
      const res = await request(app)
        .post('/api/payments/checkout')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          invoiceId: createdInvoiceId,
          provider: 'MOCK',
          currency: 'INR'
        });

      expect(res.status).toBe(200);

      // Verify in PostgreSQL
      const dbInvoice = await prisma.invoice.findUnique({
        where: { id: createdInvoiceId }
      });
      expect(dbInvoice.status).toBe('PAID');

      const dbPayment = await prisma.payment.findFirst({
        where: { invoiceId: createdInvoiceId }
      });
      expect(dbPayment).not.toBeNull();
      expect(dbPayment.status).toBe('SUCCESS');
      expect(dbPayment.currency).toBe('INR');
      expect(dbPayment.transactionId.startsWith('txn_')).toBe(true);
    });
  });

  describe('6. Messaging Persistence & Dashboard Statistics', () => {
    it('should persist conversation and message exchange in PostgreSQL', async () => {
      // Freelancer User ID
      const freelancerUser = await prisma.user.findUnique({
        where: { email: testFreelancer.email }
      });

      // Client initiates message
      const res = await request(app)
        .post('/api/chat/messages')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          recipientId: freelancerUser.id,
          content: 'Hello Julian, welcome to the project! Looking forward to working together.'
        });

      expect(res.status).toBe(201);
      activeConversationId = res.body.data.conversationId;
      expect(activeConversationId).toBeTruthy();

      // Read back messages via conversation endpoint as Freelancer
      const readRes = await request(app)
        .get(`/api/chat/${activeConversationId}/messages`)
        .set('Authorization', `Bearer ${freelancerToken}`);

      expect(readRes.status).toBe(200);
      const messages = readRes.body.data.messages || readRes.body.data;
      expect(Array.isArray(messages)).toBe(true);
      expect(messages.some(m => m.content.includes('welcome to the project'))).toBe(true);
    });

    it('should retrieve real aggregated PostgreSQL metrics for Client Dashboard', async () => {
      const res = await request(app)
        .get('/api/dashboard/client')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const stats = res.body.data.stats || res.body.data;
      expect(Number(stats.totalProjects)).toBeGreaterThanOrEqual(1);
      expect(Number(stats.activeContracts)).toBeGreaterThanOrEqual(1);
    });

    it('should retrieve real aggregated PostgreSQL metrics for Freelancer Dashboard', async () => {
      const res = await request(app)
        .get('/api/dashboard/freelancer')
        .set('Authorization', `Bearer ${freelancerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const stats = res.body.data.stats || res.body.data;
      expect(Number(stats.totalProposals)).toBeGreaterThanOrEqual(1);
    });
  });
});
