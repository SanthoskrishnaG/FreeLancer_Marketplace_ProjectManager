import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(5, 'Project title must be at least 5 characters').max(120),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  requirements: z.string().optional(),
  budget: z.number().positive('Budget must be positive'),
  minBudget: z.number().positive().optional(),
  maxBudget: z.number().positive().optional(),
  budgetType: z.enum(['FIXED', 'HOURLY']).default('FIXED'),
  experienceLevel: z.enum(['ENTRY', 'INTERMEDIATE', 'EXPERT']).default('INTERMEDIATE'),
  categoryId: z.string().uuid('Valid category ID is required').optional(),
  skillIds: z.array(z.string().uuid()).optional(),
  deadline: z.string().datetime().optional().nullable(),
  milestones: z
    .array(
      z.object({
        title: z.string().min(3),
        description: z.string().optional(),
        amount: z.number().positive(),
        order: z.number().int().optional(),
        dueDate: z.string().optional().nullable(),
        deliverables: z.array(z.string()).optional(),
        acceptanceCriteria: z.array(z.string()).optional(),
      })
    )
    .optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const aiGenerateMilestonesSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters long'),
  budget: z.number().positive().optional(),
  timelineWeeks: z.number().positive().optional(),
});
