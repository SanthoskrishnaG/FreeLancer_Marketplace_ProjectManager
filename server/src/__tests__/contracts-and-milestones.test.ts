import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { signAccessToken } from '../utils/jwt.util.js';
import { ContractRepository } from '../repositories/contract.repository.js';
import { MilestoneRepository } from '../repositories/milestone.repository.js';
import { ProfileRepository } from '../repositories/profile.repository.js';
import { UserRole, ContractStatus, MilestoneStatus } from '@prisma/client';

describe('Contracts & Milestone Workflow Suite', () => {
  const app = createApp();

  const clientUserId = 'client-uuid-111';
  const clientProfileId = 'cp-uuid-111';

  const freelancerUserId = 'freelancer-uuid-222';
  const freelancerProfileId = 'fp-uuid-222';

  const contractId = 'contract-uuid-101';
  const milestoneId = 'milestone-uuid-202';

  const clientToken = signAccessToken({
    userId: clientUserId,
    email: 'client@company.io',
    role: UserRole.CLIENT,
  });

  const freelancerToken = signAccessToken({
    userId: freelancerUserId,
    email: 'freelancer@dev.io',
    role: UserRole.FREELANCER,
  });

  const mockClientUser = {
    id: clientUserId,
    email: 'client@company.io',
    role: UserRole.CLIENT,
    clientProfile: { id: clientProfileId },
    freelancerProfile: null,
  };

  const mockFreelancerUser = {
    id: freelancerUserId,
    email: 'freelancer@dev.io',
    role: UserRole.FREELANCER,
    freelancerProfile: { id: freelancerProfileId },
    clientProfile: null,
  };

  const mockContract = {
    id: contractId,
    projectId: 'proj-1',
    clientId: clientProfileId,
    freelancerProfileId,
    totalAmount: 3000,
    status: ContractStatus.ACTIVE,
    milestones: [
      {
        id: milestoneId,
        title: 'Phase 1: Design & Architecture',
        amount: 1500,
        status: MilestoneStatus.IN_PROGRESS,
        submissions: [],
        revisions: [],
      },
      {
        id: 'milestone-2',
        title: 'Phase 2: Final Release',
        amount: 1500,
        status: MilestoneStatus.PENDING,
        submissions: [],
        revisions: [],
      },
    ],
    client: { id: clientProfileId, user: { firstName: 'Alice' } },
    freelancerProfile: { id: freelancerProfileId, user: { firstName: 'Bob' }, skills: [] },
    project: { id: 'proj-1', title: 'Web App' },
    conversation: { id: 'conv-1' },
  };

  describe('Contract Retrieval & Progress Calculation', () => {
    it('GET /api/contracts/my-contracts should list contracts for authenticated user', async () => {
      vi.spyOn(ProfileRepository, 'getUserFullProfile').mockResolvedValue(mockClientUser as any);
      vi.spyOn(ContractRepository, 'getUserContracts').mockResolvedValue({
        contracts: [
          {
            ...mockContract,
            totalMilestones: 2,
            completedMilestones: 1,
            progressPercentage: 50,
          } as any,
        ],
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
      });

      const res = await request(app)
        .get('/api/contracts/my-contracts')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.contracts.length).toBe(1);
      expect(res.body.data.contracts[0].progressPercentage).toBe(50);
    });

    it('GET /api/contracts/:id should return full contract with milestones for authorized party', async () => {
      vi.spyOn(ProfileRepository, 'getUserFullProfile').mockResolvedValue(mockClientUser as any);
      vi.spyOn(ContractRepository, 'findContractById').mockResolvedValue(mockContract as any);

      const res = await request(app)
        .get(`/api/contracts/${contractId}`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(contractId);
      expect(res.body.data.milestones.length).toBe(2);
    });
  });

  describe('Milestone State Workflow', () => {
    it('POST /api/milestones/:id/submit should allow freelancer to submit deliverables', async () => {
      vi.spyOn(ProfileRepository, 'getUserFullProfile').mockResolvedValue(
        mockFreelancerUser as any
      );
      vi.spyOn(MilestoneRepository, 'findMilestoneById').mockResolvedValue({
        id: milestoneId,
        status: MilestoneStatus.IN_PROGRESS,
        contract: mockContract,
      } as any);

      vi.spyOn(MilestoneRepository, 'createSubmission').mockResolvedValue({
        id: 'sub-uuid-1',
        milestoneId,
        freelancerProfileId,
        description: 'Completed wireframes and database modeling with full documentation.',
        links: ['https://github.com/project/pull/1'],
        files: [],
      } as any);

      const res = await request(app)
        .post(`/api/milestones/${milestoneId}/submit`)
        .set('Authorization', `Bearer ${freelancerToken}`)
        .send({
          description: 'Completed wireframes and database modeling with full documentation.',
          links: ['https://github.com/project/pull/1'],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('sub-uuid-1');
    });

    it('POST /api/milestones/:id/request-revision should allow client to request changes', async () => {
      vi.spyOn(ProfileRepository, 'getUserFullProfile').mockResolvedValue(mockClientUser as any);
      vi.spyOn(MilestoneRepository, 'findMilestoneById').mockResolvedValue({
        id: milestoneId,
        status: MilestoneStatus.SUBMITTED,
        contract: mockContract,
      } as any);

      vi.spyOn(MilestoneRepository, 'createRevisionRequest').mockResolvedValue({
        id: 'rev-uuid-1',
        milestoneId,
        clientId: clientProfileId,
        feedback: 'Please refine mobile responsiveness on the checkout step.',
        requestedChanges: ['Fix navigation drawer on iPhone screens'],
      } as any);

      const res = await request(app)
        .post(`/api/milestones/${milestoneId}/request-revision`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          feedback: 'Please refine mobile responsiveness on the checkout step.',
          requestedChanges: ['Fix navigation drawer on iPhone screens'],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('rev-uuid-1');
    });

    it('POST /api/milestones/:id/approve should allow client to approve milestone', async () => {
      vi.spyOn(ProfileRepository, 'getUserFullProfile').mockResolvedValue(mockClientUser as any);
      vi.spyOn(MilestoneRepository, 'findMilestoneById').mockResolvedValue({
        id: milestoneId,
        status: MilestoneStatus.SUBMITTED,
        contract: mockContract,
      } as any);

      vi.spyOn(MilestoneRepository, 'approveMilestone').mockResolvedValue({
        id: milestoneId,
        status: MilestoneStatus.APPROVED,
      } as any);

      const res = await request(app)
        .post(`/api/milestones/${milestoneId}/approve`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(MilestoneStatus.APPROVED);
    });
  });
});
