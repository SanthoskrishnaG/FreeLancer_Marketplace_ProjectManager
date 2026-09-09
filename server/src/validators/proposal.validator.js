import { z } from 'zod';

export const createProposalSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  coverLetter: z.string().min(30, 'Cover letter must be at least 30 characters'),
  bidAmount: z.number().positive('Proposed bid must be a positive number'),
  estimatedDuration: z.string().min(1, 'Estimated duration is required'),
  milestonePricing: z
    .array(
      z.object({
        title: z.string().min(3),
        amount: z.number().positive(),
        duration: z.string().optional(),
      })
    )
    .optional(),
  attachments: z.array(z.string().url()).optional(),
});

export const submitProposalSchema = createProposalSchema;
