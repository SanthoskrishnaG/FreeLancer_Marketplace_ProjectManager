import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { signAccessToken } from '../utils/jwt.util.js';
import { AIRequirementService } from '../services/ai-requirement.service.js';
import { ProjectRepository } from '../repositories/project.repository.js';
import { ProfileRepository } from '../repositories/profile.repository.js';
import { UserRole, ProjectStatus, ExperienceLevel } from '@prisma/client';

describe('Project Management & AI Milestone Analysis Suite', () => {
  const app = createApp();

  const clientUserId = 'client-uuid-111';
  const clientProfileId = 'cp-uuid-111';
  const freelancerUserId = 'freelancer-uuid-222';

  const clientToken = signAccessToken({
    userId: clientUserId,
    email: 'client@techcorp.io',
    role: UserRole.CLIENT,
  });

  const freelancerToken = signAccessToken({
    userId: freelancerUserId,
    email: 'freelancer@dev.io',
    role: UserRole.FREELANCER,
  });

  describe('AI Requirement Analysis Service & Zod Validation', () => {
    it('should generate valid structured milestones matching schema with fallback engine', async () => {
      const result = await AIRequirementService.generateMilestones({
        projectTitle: 'E-commerce clothing store with checkout and cart',
        projectDescription:
          'Full stack online clothing store with product catalog, cart, stripe checkout, and admin dashboard',
        projectRequirements:
          'Next.js frontend, Node.js backend, Stripe webhook, PostgreSQL database',
        totalBudget: 5000,
      });

      expect(result.source).toBeDefined();
      expect(result.milestones.length).toBeGreaterThanOrEqual(4);
      expect(result.summary).toBeDefined();

      let totalPct = 0;
      let totalAmount = 0;

      result.milestones.forEach((m, idx) => {
        expect(m.title).toBeTruthy();
        expect(m.description).toBeTruthy();
        expect(Array.isArray(m.deliverables)).toBe(true);
        expect(m.deliverables.length).toBeGreaterThan(0);
        expect(m.estimatedDuration).toBeTruthy();
        expect(m.budgetPercentage).toBeGreaterThan(0);
        expect(m.amount).toBeGreaterThan(0);
        expect(Array.isArray(m.acceptanceCriteria)).toBe(true);
        expect(m.order).toBe(idx + 1);

        totalPct += m.budgetPercentage;
        totalAmount += m.amount;
      });

      // Sum of percentages must equal ~100
      expect(totalPct).toBe(100);
      expect(totalAmount).toBe(5000);
    });

    it('should generate mobile-specific milestones when mobile keywords are present', async () => {
      const result = await AIRequirementService.generateMilestones({
        projectTitle: 'Flutter iOS and Android Fitness Tracking Mobile App',
        projectDescription:
          'Native-feel mobile app tracking user workouts, GPS running paths, and nutrition',
        totalBudget: 4000,
      });

      expect(
        result.milestones.some(
          (m) => m.title.toLowerCase().includes('mobile') || m.title.toLowerCase().includes('app')
        )
      ).toBe(true);
    });
  });

  describe('Project Management API Authorization & Endpoints', () => {
    it('POST /api/projects should block unauthenticated users with 401', async () => {
      const res = await request(app)
        .post('/api/projects')
        .send({
          title: 'Unauthorized project',
          description: 'Testing 401',
          budget: 1000,
          skillIds: ['00000000-0000-0000-0000-000000000000'],
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/projects should block FREELANCER accounts with 403', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${freelancerToken}`)
        .send({
          title: 'Freelancer trying to post project',
          description: 'This is a test description that is long enough to pass validation rules',
          budget: 1500,
          skillIds: ['11111111-1111-1111-1111-111111111111'],
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/projects should create project when called by valid CLIENT', async () => {
      const mockClientUser = {
        id: clientUserId,
        email: 'client@techcorp.io',
        role: UserRole.CLIENT,
        clientProfile: { id: clientProfileId },
        freelancerProfile: null,
      };

      const mockCreatedProject = {
        id: 'proj-uuid-101',
        clientId: clientProfileId,
        title: 'Full Stack Web Platform',
        description: 'A comprehensive web application with React and Node.js',
        requirements: 'Real-time dashboard and PostgreSQL database',
        budget: 3500,
        budgetType: 'FIXED',
        experienceLevel: ExperienceLevel.INTERMEDIATE,
        status: ProjectStatus.DRAFT,
        category: { id: 'cat-1', name: 'Web Development' },
        skills: [],
        client: {
          id: clientProfileId,
          user: { id: clientUserId, firstName: 'Alex', lastName: 'Rivers', avatarUrl: null },
        },
      };

      vi.spyOn(ProfileRepository, 'getUserFullProfile').mockResolvedValue(mockClientUser as any);
      vi.spyOn(ProjectRepository, 'createProject').mockResolvedValue(mockCreatedProject as any);

      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          title: 'Full Stack Web Platform',
          description:
            'A comprehensive web application with React and Node.js that meets the minimum length',
          requirements: 'Real-time dashboard and PostgreSQL database',
          budget: 3500,
          budgetType: 'FIXED',
          experienceLevel: ExperienceLevel.INTERMEDIATE,
          skillIds: ['22222222-2222-2222-2222-222222222222'],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Full Stack Web Platform');
    });

    it('GET /api/projects should return public projects list with pagination', async () => {
      vi.spyOn(ProjectRepository, 'getPublicMarketplaceProjects').mockResolvedValue({
        projects: [
          {
            id: 'proj-1',
            title: 'Test Marketplace Project',
            description: 'Description of marketplace project',
            budget: 2000 as any,
            budgetType: 'FIXED',
            status: ProjectStatus.PUBLISHED,
            category: { id: 'cat-1', name: 'Web Dev', slug: 'web-dev' } as any,
            skills: [],
            client: { user: { firstName: 'Sarah', lastName: 'Chen' } } as any,
            _count: { proposals: 3, milestones: 4 },
            isBookmarked: false,
          } as any,
        ],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });

      const res = await request(app).get('/api/projects');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.projects.length).toBe(1);
      expect(res.body.data.pagination.total).toBe(1);
    });
  });
});
