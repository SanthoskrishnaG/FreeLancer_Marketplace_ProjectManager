import { z } from 'zod';
import { InvoiceStatus } from '@prisma/client';

export const createInvoiceSchema = z.object({
  body: z.object({
    contractId: z.string().uuid({ message: 'Valid contract ID is required' }),
    dueDate: z.string().optional(),
    tax: z.number().nonnegative().optional(),
    notes: z.string().optional(),
  }),
});

export const updateInvoiceStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(InvoiceStatus, {
      errorMap: () => ({ message: 'Valid invoice status is required' }),
    }),
  }),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>['body'];
export type UpdateInvoiceStatusInput = z.infer<typeof updateInvoiceStatusSchema>['body'];
