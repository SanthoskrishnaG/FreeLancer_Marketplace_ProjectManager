import { z } from 'zod';

export const submitMilestoneSchema = z.object({
  description: z.string().min(10, 'Submission description must be at least 10 characters'),
  notes: z.string().optional(),
  links: z.array(z.string().url('Invalid link URL')).optional(),
});

export const requestRevisionSchema = z.object({
  feedback: z.string().min(10, 'Revision feedback must be at least 10 characters'),
  requestedChanges: z.array(z.string()).min(1, 'At least one requested change item is required'),
  dueDate: z.string().datetime().optional(),
});

export const createReviewSchema = z.object({
  contractId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5, 'Review comment must be at least 5 characters').max(1000),
});

export const createDisputeSchema = z.object({
  contractId: z.string().uuid(),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  evidence: z.array(z.string()).optional(),
});

export const resolveDisputeSchema = z.object({
  status: z.enum(['RESOLVED', 'REJECTED']),
  adminDecision: z.string().min(5, 'Decision summary is required'),
  resolutionNotes: z.string().optional(),
});
