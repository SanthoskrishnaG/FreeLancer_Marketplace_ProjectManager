import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { signAccessToken } from '../utils/jwt.util.js';
import { ProposalRepository } from '../repositories/proposal.repository.js';
import { ProjectRepository } from '../repositories/project.repository.js';
import { ProfileRepository } from '../repositories/profile.repository.js';
import { UserRole, ProjectStatus, ProposalStatus } from '@prisma/client';

describe('Freelancer Proposal System Suite', () => {
  const app = createApp();

  const clientUserId = 'client-uuid-111';
  const clientProfileId = 'cp-uuid-111';

  const freelancerUserId = 'freelancer-uuid-222';
  const freelancerProfileId = 'fp-uuid-222';

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

  const sampleProjectId = '11111111-2222-3333-4444-555555555555';
  const sampleProposalId = '66666666-7777-8888-9999-000000000000';

  const mockFreelancerUser = {
    id: freelancerUserId,
    email: 'freelancer@dev.io',
    role: UserRole.FREELANCER,
    freelancerProfile: {
      id: freelancerProfileId,
      title: 'Full Stack Engineer',
      hourlyRate: 85,
    },
    clientProfile: null,
  };

  const mockClientUser = {
    id: clientUserId,
    email: 'client@company.io',
    role: UserRole.CLIENT,
    clientProfile: {
      id: clientProfileId,
      companyName: 'Acme SaaS',
    },
    freelancerProfile: null,
  };

  const mockPublishedProject = {
    id: sampleProjectId,
    clientId: clientProfileId,
    title: 'Modern Web Application',
    status: ProjectStatus.PUBLISHED,
    budget: 3000,
    budgetType: 'FIXED',
    proposalCount: 2,
  };

  describe('Proposal Submission & Validations', () => {
    it('POST /api/proposals should fail if user is CLIENT (403)', async () => {
      const res = await request(app)
        .post('/api/proposals')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          projectId: sampleProjectId,
          coverLetter: 'I am a client trying to propose and should be blocked by guard.',
          bidAmount: 2500,
          estimatedDuration: '2 weeks',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/proposals should fail if project is not PUBLISHED (400)', async () => {
      vi.spyOn(ProfileRepository, 'getUserFullProfile').mockResolvedValue(
        mockFreelancerUser as any
      );
      vi.spyOn(ProjectRepository, 'getProjectById').mockResolvedValue({
        ...mockPublishedProject,
        status: ProjectStatus.DRAFT,
      } as any);

      const res = await request(app)
        .post('/api/proposals')
        .set('Authorization', `Bearer ${freelancerToken}`)
        .send({
          projectId: sampleProjectId,
          coverLetter:
            'This is an extensive cover letter detailing experience and architectural setup for the project.',
          bidAmount: 2800,
          estimatedDuration: '3 weeks',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Only PUBLISHED projects accept bids');
    });

    it('POST /api/proposals should block duplicate proposals on the same project (400)', async () => {
      vi.spyOn(ProfileRepository, 'getUserFullProfile').mockResolvedValue(
        mockFreelancerUser as any
      );
      vi.spyOn(ProjectRepository, 'getProjectById').mockResolvedValue(mockPublishedProject as any);
      vi.spyOn(ProposalRepository, 'findExistingProposal').mockResolvedValue({
        id: sampleProposalId,
        projectId: sampleProjectId,
        freelancerProfileId,
      } as any);

      const res = await request(app)
        .post('/api/proposals')
        .set('Authorization', `Bearer ${freelancerToken}`)
        .send({
          projectId: sampleProjectId,
          coverLetter:
            'This is an extensive cover letter detailing experience and architectural setup for the project.',
          bidAmount: 2500,
          estimatedDuration: '2 weeks',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Duplicate proposals are not allowed');
    });

    it('POST /api/proposals should create proposal when submitted by valid FREELANCER (201)', async () => {
      vi.spyOn(ProfileRepository, 'getUserFullProfile').mockResolvedValue(
        mockFreelancerUser as any
      );
      vi.spyOn(ProjectRepository, 'getProjectById').mockResolvedValue(mockPublishedProject as any);
      vi.spyOn(ProposalRepository, 'findExistingProposal').mockResolvedValue(null);
      vi.spyOn(ProposalRepository, 'createProposal').mockResolvedValue({
        id: sampleProposalId,
        projectId: sampleProjectId,
        freelancerProfileId,
        coverLetter:
          'This is an extensive cover letter detailing experience and architectural setup for the project.',
        bidAmount: 2500,
        estimatedDuration: '2 weeks',
        status: ProposalStatus.PENDING,
        createdAt: new Date(),
      } as any);

      const res = await request(app)
        .post('/api/proposals')
        .set('Authorization', `Bearer ${freelancerToken}`)
        .send({
          projectId: sampleProjectId,
          coverLetter:
            'This is an extensive cover letter detailing experience and architectural setup for the project.',
          bidAmount: 2500,
          estimatedDuration: '2 weeks',
          milestonePricing: [
            { title: 'Milestone 1: Prototype', amount: 1000, duration: '1 week' },
            { title: 'Milestone 2: Release', amount: 1500, duration: '1 week' },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(sampleProposalId);
    });
  });

  describe('Proposal Management & Client Review Actions', () => {
    it('PATCH /api/proposals/:id/shortlist should allow project owner to shortlist proposal', async () => {
      const mockProposal = {
        id: sampleProposalId,
        projectId: sampleProjectId,
        freelancerProfileId,
        status: ProposalStatus.PENDING,
        project: {
          clientId: clientProfileId,
          status: ProjectStatus.PUBLISHED,
        },
      };

      vi.spyOn(ProposalRepository, 'findProposalById').mockResolvedValue(mockProposal as any);
      vi.spyOn(ProfileRepository, 'getUserFullProfile').mockResolvedValue(mockClientUser as any);
      vi.spyOn(ProposalRepository, 'updateProposalStatus').mockResolvedValue({
        ...mockProposal,
        status: ProposalStatus.SHORTLISTED,
      } as any);

      const res = await request(app)
        .patch(`/api/proposals/${sampleProposalId}/shortlist`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(ProposalStatus.SHORTLISTED);
    });

    it('PATCH /api/proposals/:id/withdraw should allow author freelancer to withdraw proposal', async () => {
      const mockProposal = {
        id: sampleProposalId,
        projectId: sampleProjectId,
        freelancerProfileId,
        status: ProposalStatus.PENDING,
        project: {
          clientId: clientProfileId,
          status: ProjectStatus.PUBLISHED,
        },
      };

      vi.spyOn(ProposalRepository, 'findProposalById').mockResolvedValue(mockProposal as any);
      vi.spyOn(ProfileRepository, 'getUserFullProfile').mockResolvedValue(
        mockFreelancerUser as any
      );
      vi.spyOn(ProposalRepository, 'updateProposalStatus').mockResolvedValue({
        ...mockProposal,
        status: ProposalStatus.WITHDRAWN,
      } as any);

      const res = await request(app)
        .patch(`/api/proposals/${sampleProposalId}/withdraw`)
        .set('Authorization', `Bearer ${freelancerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(ProposalStatus.WITHDRAWN);
    });

    it('PATCH /api/proposals/:id/accept should execute transaction and return contract initiation', async () => {
      const mockProposal = {
        id: sampleProposalId,
        projectId: sampleProjectId,
        freelancerProfileId,
        bidAmount: 2500,
        status: ProposalStatus.PENDING,
        project: {
          clientId: clientProfileId,
          status: ProjectStatus.PUBLISHED,
        },
      };

      vi.spyOn(ProposalRepository, 'findProposalById').mockResolvedValue(mockProposal as any);
      vi.spyOn(ProfileRepository, 'getUserFullProfile').mockResolvedValue(mockClientUser as any);
      vi.spyOn(ProposalRepository, 'acceptProposal').mockResolvedValue({
        proposal: { ...mockProposal, status: ProposalStatus.ACCEPTED } as any,
        contract: {
          id: 'contract-uuid-999',
          projectId: sampleProjectId,
          clientId: clientProfileId,
          freelancerProfileId,
          totalAmount: 2500,
          status: 'ACTIVE',
        } as any,
      });

      const res = await request(app)
        .patch(`/api/proposals/${sampleProposalId}/accept`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.contract.id).toBe('contract-uuid-999');
    });
  });
});
