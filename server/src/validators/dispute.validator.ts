import { z } from 'zod';
import { DisputeStatus } from '@prisma/client';

export const createDisputeSchema = z.object({
  body: z.object({
    contractId: z.string().uuid({ message: 'Valid contract ID is required' }),
    reason: z.string().min(5, 'Reason must be at least 5 characters').max(200),
    description: z.string().min(15, 'Please provide a detailed description of the dispute (at least 15 characters)').max(3000),
    evidence: z.array(z.string()).optional(),
  }),
});

export const addDisputeMessageSchema = z.object({
  body: z.object({
    message: z.string().min(1, 'Message cannot be empty').max(2000),
    attachments: z.array(z.string()).optional(),
  }),
});

export const resolveDisputeSchema = z.object({
  body: z.object({
    adminDecision: z.string().min(3, 'Decision summary is required').max(200),
    resolutionNotes: z.string().min(10, 'Resolution notes must be at least 10 characters').max(3000),
  }),
});

export const rejectDisputeSchema = z.object({
  body: z.object({
    resolutionNotes: z.string().min(10, 'Rejection reason notes must be at least 10 characters').max(3000),
  }),
});

export const updateDisputeStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(DisputeStatus, {
      errorMap: () => ({ message: 'Valid dispute status is required' }),
    }),
    notes: z.string().optional(),
  }),
});

export type CreateDisputeInput = z.infer<typeof createDisputeSchema>['body'];
export type AddDisputeMessageInput = z.infer<typeof addDisputeMessageSchema>['body'];
export type ResolveDisputeInput = z.infer<typeof resolveDisputeSchema>['body'];
export type RejectDisputeInput = z.infer<typeof rejectDisputeSchema>['body'];
export type UpdateDisputeStatusInput = z.infer<typeof updateDisputeStatusSchema>['body'];
