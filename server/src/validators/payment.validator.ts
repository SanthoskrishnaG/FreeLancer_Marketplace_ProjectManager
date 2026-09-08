import { z } from 'zod';

export const processPaymentSchema = z.object({
  invoiceId: z.string().uuid({ message: 'Valid invoice ID is required' }),
  provider: z.string().default('MOCK').optional(),
  paymentMethod: z.string().default('mock_card').optional(),
  currency: z.string().default('USD').optional(),
});

export const paymentQuerySchema = z.object({
  invoiceId: z.string().uuid().optional(),
  contractId: z.string().uuid().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type ProcessPaymentInput = z.infer<typeof processPaymentSchema>;
export type PaymentQueryInput = z.infer<typeof paymentQuerySchema>;
