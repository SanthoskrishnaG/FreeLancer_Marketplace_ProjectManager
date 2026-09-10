import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { signAccessToken } from '../utils/jwt.util.js';
import { ProfileRepository } from '../repositories/profile.repository.js';
import { ContractRepository } from '../repositories/contract.repository.js';
import { ReviewRepository } from '../repositories/review.repository.js';
import { DisputeRepository } from '../repositories/dispute.repository.js';
import { prisma } from '../config/database.js';
import { UserRole, ContractStatus, DisputeStatus } from '@prisma/client';

describe('Reviews & Dispute Management Suite', () => {
  const app = createApp();

  const clientUserId = 'client-rev-111';
  const clientProfileId = 'client-prof-111';
  const freelancerUserId = 'freelancer-rev-222';
  const freelancerProfileId = 'freelancer-prof-222';
  const adminUserId = 'admin-rev-333';

  const contractId = '00000000-0000-0000-0000-000000000010';
  const disputeId = '00000000-0000-0000-0000-000000000020';

  const clientToken = signAccessToken({
    userId: clientUserId,
    email: 'client.reviews@market.io',
    role: UserRole.CLIENT,
  });

  const freelancerToken = signAccessToken({
    userId: freelancerUserId,
    email: 'freelancer.reviews@market.io',
    role: UserRole.FREELANCER,
  });

  const adminToken = signAccessToken({
    userId: adminUserId,
    email: 'admin.disputes@market.io',
    role: UserRole.ADMIN,
  });

  const mockClientUser = {
    id: clientUserId,
    email: 'client.reviews@market.io',
    firstName: 'Alice',
    lastName: 'Client',
    role: UserRole.CLIENT,
    clientProfile: { id: clientProfileId },
    freelancerProfile: null,
  };

  const mockFreelancerUser = {
    id: freelancerUserId,
    email: 'freelancer.reviews@market.io',
    firstName: 'Bob',
    lastName: 'Freelancer',
    role: UserRole.FREELANCER,
    freelancerProfile: { id: freelancerProfileId },
    clientProfile: null,
  };

  const mockAdminUser = {
    id: adminUserId,
    email: 'admin.disputes@market.io',
    firstName: 'System',
    lastName: 'Admin',
    role: UserRole.ADMIN,
    clientProfile: null,
    freelancerProfile: null,
  };

  const mockCompletedContract = {
    id: contractId,
    projectId: 'proj-1',
    clientId: clientProfileId,
    freelancerProfileId,
    status: ContractStatus.COMPLETED,
    project: { title: 'Cloud Infrastructure' },
    client: { id: clientProfileId, userId: clientUserId },
    freelancerProfile: { id: freelancerProfileId, userId: freelancerUserId },
    milestones: [],
  };

  const mockActiveContract = {
    ...mockCompletedContract,
    status: ContractStatus.ACTIVE,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Contract Reviews & Rating Recalculation', () => {
    it('POST /api/reviews should allow client to submit 1-5 star review when contract is COMPLETED', async () => {
      vi.spyOn(ProfileRepository, 'getUserFullProfile').mockResolvedValue(mockClientUser as any);
      vi.spyOn(ContractRepository, 'findContractById').mockResolvedValue(mockCompletedContract as any);
      vi.spyOn(ReviewRepository, 'findExistingReview').mockResolvedValue(null);
      vi.spyOn(ReviewRepository, 'createReview').mockResolvedValue({
        id: 'review-1',
        contractId,
        authorId: clientUserId,
        recipientId: freelancerUserId,
        rating: 5,
        comment: 'Outstanding delivery and excellent code quality!',
        createdAt: new Date(),
      } as any);
      vi.spyOn(ReviewRepository, 'calculateAverageRating').mockResolvedValue({
        average: 4.9,
        count: 5,
      });
      vi.spyOn(ReviewRepository, 'updateFreelancerProfileRating').mockResolvedValue({} as any);
      vi.spyOn(prisma.notification, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          contractId,
          rating: 5,
          comment: 'Outstanding delivery and excellent code quality!',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rating).toBe(5);
      expect(ReviewRepository.updateFreelancerProfileRating).toHaveBeenCalledWith(
        freelancerProfileId,
        4.9,
        5
      );
    });

    it('POST /api/reviews should block review if contract is still ACTIVE (not completed)', async () => {
      vi.spyOn(ProfileRepository, 'getUserFullProfile').mockResolvedValue(mockClientUser as any);
      vi.spyOn(ContractRepository, 'findContractById').mockResolvedValue(mockActiveContract as any);

      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          contractId,
          rating: 5,
          comment: 'Premature review attempt',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('COMPLETED');
    });

    it('POST /api/reviews should prevent duplicate reviews on the same contract by the same author', async () => {
      vi.spyOn(ProfileRepository, 'getUserFullProfile').mockResolvedValue(mockClientUser as any);
      vi.spyOn(ContractRepository, 'findContractById').mockResolvedValue(mockCompletedContract as any);
      vi.spyOn(ReviewRepository, 'findExistingReview').mockResolvedValue({
        id: 'existing-rev',
      } as any);

      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          contractId,
          rating: 4,
          comment: 'Trying to review again duplicate',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Duplicate reviews are not allowed');
    });
  });

  describe('Contract Disputes & Administrative Workflow', () => {
    it('POST /api/disputes should allow contract parties to open a dispute', async () => {
      vi.spyOn(ProfileRepository, 'getUserFullProfile').mockResolvedValue(mockClientUser as any);
      vi.spyOn(ContractRepository, 'findContractById').mockResolvedValue(mockActiveContract as any);
      vi.spyOn(prisma.dispute, 'findFirst').mockResolvedValue(null);
      vi.spyOn(DisputeRepository, 'createDispute').mockResolvedValue({
        id: disputeId,
        contractId,
        initiatorId: clientUserId,
        reason: 'Deliverable missed deadlines',
        description: 'Freelancer did not submit Phase 2 assets on time.',
        evidence: ['https://storage.market.io/evidence1.pdf'],
        status: DisputeStatus.OPEN,
      } as any);
      vi.spyOn(prisma.contract, 'update').mockResolvedValue({} as any);
      vi.spyOn(prisma.notification, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/disputes')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          contractId,
          reason: 'Deliverable missed deadlines',
          description: 'Freelancer did not submit Phase 2 assets on time.',
          evidence: ['https://storage.market.io/evidence1.pdf'],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(DisputeStatus.OPEN);
      expect(prisma.contract.update).toHaveBeenCalledWith({
        where: { id: contractId },
        data: { status: ContractStatus.DISPUTED },
      });
    });

    it('POST /api/disputes/:id/messages should allow party to post in dispute thread', async () => {
      vi.spyOn(ProfileRepository, 'getUserFullProfile').mockResolvedValue(mockFreelancerUser as any);
      vi.spyOn(DisputeRepository, 'findDisputeById').mockResolvedValue({
        id: disputeId,
        contractId,
        initiatorId: clientUserId,
        contract: mockActiveContract,
      } as any);
      vi.spyOn(DisputeRepository, 'addMessage').mockResolvedValue({
        id: 'msg-1',
        disputeId,
        senderId: freelancerUserId,
        message: 'The deliverables were sent via email yesterday.',
        createdAt: new Date(),
      } as any);

      const res = await request(app)
        .post(`/api/disputes/${disputeId}/messages`)
        .set('Authorization', `Bearer ${freelancerToken}`)
        .send({
          message: 'The deliverables were sent via email yesterday.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toBe('The deliverables were sent via email yesterday.');
    });

    it('POST /api/disputes/:id/resolve should allow ADMIN to resolve dispute and log audit record', async () => {
      vi.spyOn(ProfileRepository, 'getUserFullProfile').mockResolvedValue(mockAdminUser as any);
      vi.spyOn(DisputeRepository, 'findDisputeById').mockResolvedValue({
        id: disputeId,
        contractId,
        contract: mockActiveContract,
      } as any);
      vi.spyOn(DisputeRepository, 'updateDispute').mockResolvedValue({
        id: disputeId,
        status: DisputeStatus.RESOLVED,
        adminDecision: 'Funds split 50/50',
        resolutionNotes: 'Evidence showed partial deliverable completion.',
        resolvedAt: new Date(),
      } as any);
      vi.spyOn(prisma.contract, 'update').mockResolvedValue({} as any);
      vi.spyOn(DisputeRepository, 'recordAuditLog').mockResolvedValue({} as any);
      vi.spyOn(prisma.notification, 'createMany').mockResolvedValue({} as any);

      const res = await request(app)
        .post(`/api/disputes/${disputeId}/resolve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          adminDecision: 'Funds split 50/50',
          resolutionNotes: 'Evidence showed partial deliverable completion.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(DisputeStatus.RESOLVED);
      expect(DisputeRepository.recordAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: adminUserId,
          entity: 'Dispute',
          entityId: disputeId,
        })
      );
    });

    it('POST /api/disputes/:id/reject should allow ADMIN to reject dispute claim and restore contract', async () => {
      vi.spyOn(ProfileRepository, 'getUserFullProfile').mockResolvedValue(mockAdminUser as any);
      vi.spyOn(DisputeRepository, 'findDisputeById').mockResolvedValue({
        id: disputeId,
        contractId,
        contract: mockActiveContract,
      } as any);
      vi.spyOn(DisputeRepository, 'updateDispute').mockResolvedValue({
        id: disputeId,
        status: DisputeStatus.REJECTED,
        resolutionNotes: 'Insufficient evidence to substantiate claim.',
        resolvedAt: new Date(),
      } as any);
      vi.spyOn(prisma.contract, 'update').mockResolvedValue({} as any);
      vi.spyOn(DisputeRepository, 'recordAuditLog').mockResolvedValue({} as any);
      vi.spyOn(prisma.notification, 'createMany').mockResolvedValue({} as any);

      const res = await request(app)
        .post(`/api/disputes/${disputeId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          resolutionNotes: 'Insufficient evidence to substantiate claim.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(DisputeStatus.REJECTED);
      expect(prisma.contract.update).toHaveBeenCalledWith({
        where: { id: contractId },
        data: { status: ContractStatus.ACTIVE },
      });
    });
  });
});
