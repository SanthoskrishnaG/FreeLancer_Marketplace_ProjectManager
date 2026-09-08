import { z } from 'zod';

export const createReviewSchema = z.object({
  contractId: z.string().uuid({ message: 'Valid contract ID is required' }),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().min(5, 'Review comment must be at least 5 characters').max(2000),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
