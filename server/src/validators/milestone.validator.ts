import { z } from 'zod';

export const submitMilestoneSchema = z.object({
  body: z.object({
    description: z.string().trim().min(10, 'Submission summary must be at least 10 characters'),
    notes: z.string().trim().optional(),
    links: z.array(z.string().url('Must be a valid URL')).default([]),
    fileIds: z.array(z.string().uuid()).default([]),
  }),
});

export const requestRevisionSchema = z.object({
  body: z.object({
    feedback: z.string().trim().min(10, 'Feedback must be at least 10 characters'),
    requestedChanges: z
      .array(z.string().trim().min(2))
      .min(1, 'Please specify at least one requested change'),
    dueDate: z.string().datetime().optional().nullable(),
  }),
});

export type SubmitMilestoneInput = z.infer<typeof submitMilestoneSchema>['body'];
export type RequestRevisionInput = z.infer<typeof requestRevisionSchema>['body'];
