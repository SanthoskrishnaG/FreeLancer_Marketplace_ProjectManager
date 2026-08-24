import { z } from 'zod';
import { ExperienceLevel, ProjectStatus } from '@prisma/client';

export const createProjectSchema = z.object({
  body: z.object({
    title: z.string().trim().min(5, 'Title must be at least 5 characters').max(150),
    description: z.string().trim().min(20, 'Description must be at least 20 characters').max(10000),
    requirements: z.string().trim().max(10000).optional(),
    categoryId: z.string().uuid('Valid category is required').optional().nullable(),
    skillIds: z.array(z.string().uuid()).min(1, 'At least 1 required skill must be selected'),
    budgetType: z.enum(['FIXED', 'HOURLY']).default('FIXED'),
    budget: z.number().positive('Budget must be greater than zero'),
    minBudget: z.number().positive().optional().nullable(),
    maxBudget: z.number().positive().optional().nullable(),
    experienceLevel: z.nativeEnum(ExperienceLevel).default(ExperienceLevel.INTERMEDIATE),
    deadline: z.string().datetime().optional().nullable(),
    status: z.enum([ProjectStatus.DRAFT, ProjectStatus.PUBLISHED]).default(ProjectStatus.DRAFT),
    attachments: z
      .array(
        z.object({
          name: z.string(),
          url: z.string().url(),
          size: z.number().optional(),
        })
      )
      .optional(),
  }),
});

export const updateProjectSchema = z.object({
  body: createProjectSchema.shape.body.partial(),
});

export const updateProjectStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      ProjectStatus.DRAFT,
      ProjectStatus.PUBLISHED,
      ProjectStatus.CANCELLED,
      ProjectStatus.ARCHIVED,
    ]),
  }),
});

export const projectQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    skill: z.string().optional(),
    budgetType: z.string().optional(),
    minBudget: z.string().optional(),
    maxBudget: z.string().optional(),
    experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
    status: z.nativeEnum(ProjectStatus).optional(),
    sortBy: z.enum(['newest', 'budget_high', 'budget_low', 'deadline']).default('newest'),
    page: z.string().default('1'),
    limit: z.string().default('10'),
  }),
});

export const generateMilestonesSchema = z.object({
  body: z.object({
    customPrompt: z.string().trim().max(2000).optional(),
  }),
});

export const saveBatchMilestonesSchema = z.object({
  body: z.object({
    milestones: z
      .array(
        z.object({
          title: z.string().min(3),
          description: z.string().optional(),
          deliverables: z.array(z.string()).default([]),
          estimatedDuration: z.string().default('1 week'),
          budgetPercentage: z.number().min(1).max(100),
          amount: z.number().nonnegative(),
          dependencies: z.array(z.string()).default([]),
          acceptanceCriteria: z.array(z.string()).default([]),
          order: z.number().int().nonnegative(),
        })
      )
      .min(1, 'At least 1 milestone is required'),
  }),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>['body'];
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>['body'];
export type BatchMilestoneItem = z.infer<
  typeof saveBatchMilestonesSchema
>['body']['milestones'][number];
