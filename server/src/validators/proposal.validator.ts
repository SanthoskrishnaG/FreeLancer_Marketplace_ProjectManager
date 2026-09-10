import { z } from 'zod';
import { ProposalStatus } from '@prisma/client';

export const createProposalSchema = z.object({
  body: z.object({
    projectId: z.string().uuid('Valid project ID is required'),
    coverLetter: z
      .string()
      .trim()
      .min(30, 'Cover letter must be at least 30 characters')
      .max(5000, 'Cover letter cannot exceed 5000 characters'),
    bidAmount: z.number().positive('Proposed bid must be greater than zero'),
    estimatedDuration: z.string().trim().min(2, 'Estimated duration is required'),
    milestonePricing: z
      .array(
        z.object({
          title: z.string().min(1, 'Milestone title is required'),
          amount: z.number().positive('Milestone amount must be positive'),
          duration: z.string().optional(),
        })
      )
      .optional(),
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

export const proposalQuerySchema = z.object({
  query: z.object({
    status: z.nativeEnum(ProposalStatus).optional(),
    sortBy: z.enum(['newest', 'bid_low', 'bid_high', 'rating']).default('newest'),
    page: z.string().default('1'),
    limit: z.string().default('10'),
  }),
});

export type CreateProposalInput = z.infer<typeof createProposalSchema>['body'];
