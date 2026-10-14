import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(5, 'Project title must be at least 5 characters').max(120),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  requirements: z.string().optional().nullable(),
  budget: z.preprocess((val) => Number(val), z.number().positive('Budget must be positive')),
  minBudget: z.preprocess((val) => (val !== undefined && val !== null ? Number(val) : undefined), z.number().positive().optional()),
  maxBudget: z.preprocess((val) => (val !== undefined && val !== null ? Number(val) : undefined), z.number().positive().optional()),
  budgetType: z.enum(['FIXED', 'HOURLY']).default('FIXED'),
  experienceLevel: z.enum(['ENTRY', 'INTERMEDIATE', 'EXPERT']).default('INTERMEDIATE'),
  categoryId: z.preprocess((val) => (val === '' ? undefined : val), z.string().uuid('Valid category ID is required').optional().nullable()),
  skillIds: z.array(z.string().uuid()).optional(),
  deadline: z.string().optional().nullable(),
  milestones: z
    .array(
      z.object({
        title: z.string().min(3),
        description: z.string().optional().nullable(),
        amount: z.preprocess((val) => Number(val), z.number().positive()),
        order: z.number().int().optional(),
        dueDate: z.string().optional().nullable(),
        deliverables: z
          .union([z.string().transform((s) => (s ? [s] : [])), z.array(z.string())])
          .optional(),
        acceptanceCriteria: z
          .union([z.string().transform((s) => (s ? [s] : [])), z.array(z.string())])
          .optional(),
      })
    )
    .optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const createProjectIdeaSchema = z.object({
  title: z.string().min(5, 'Project title must be at least 5 characters').max(120),
  summary: z.string().min(10, 'Project idea/summary must be at least 10 characters'),
  description: z.string().min(20, 'Detailed description must be at least 20 characters'),
  requirements: z.string().optional().nullable(),
  categoryId: z.preprocess((val) => (val === '' ? undefined : val), z.string().uuid('Valid category ID is required').optional().nullable()),
  skillIds: z.array(z.string().uuid()).optional(),
  budget: z.preprocess((val) => Number(val), z.number().positive('Target budget must be positive')),
  minBudget: z.preprocess((val) => (val !== undefined && val !== null && val !== '' ? Number(val) : undefined), z.number().positive('Minimum budget must be positive').optional()),
  maxBudget: z.preprocess((val) => (val !== undefined && val !== null && val !== '' ? Number(val) : undefined), z.number().positive('Maximum budget must be positive').optional()),
  durationWeeks: z.preprocess((val) => (val !== undefined && val !== null && val !== '' ? Number(val) : undefined), z.number().int().positive('Duration must be a positive integer').optional()),
  durationUnit: z.enum(['days', 'weeks', 'months']).default('weeks'),
  startDate: z.string().optional().nullable(),
  targetEndDate: z.string().optional().nullable(),
  experienceLevel: z.enum(['ENTRY', 'INTERMEDIATE', 'EXPERT']).default('INTERMEDIATE'),
  referenceLinks: z.array(z.string().url('Reference link must be a valid URL')).optional(),
  milestones: z
    .array(
      z.object({
        title: z.string().min(3, 'Milestone title must be at least 3 characters'),
        description: z.string().optional().nullable(),
        deliverables: z
          .union([z.string().transform((s) => (s ? [s] : [])), z.array(z.string())])
          .optional(),
        estimatedDuration: z.string().optional().nullable(),
        amount: z.preprocess((val) => Number(val), z.number().positive('Milestone amount must be positive')),
        dueDate: z.string().optional().nullable(),
        acceptanceCriteria: z
          .union([z.string().transform((s) => (s ? [s] : [])), z.array(z.string())])
          .optional(),
        order: z.number().int().optional(),
        status: z.enum(['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'COMPLETED']).optional().default('PENDING'),
      })
    )
    .optional(),
});

export const aiGenerateMilestonesSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters long'),
  budget: z.number().positive().optional(),
  timelineWeeks: z.number().positive().optional(),
});

