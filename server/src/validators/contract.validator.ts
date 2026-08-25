import { z } from 'zod';
import { ContractStatus } from '@prisma/client';

export const updateContractStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(ContractStatus),
    reason: z.string().optional(),
  }),
});

export const contractQuerySchema = z.object({
  query: z.object({
    status: z.nativeEnum(ContractStatus).optional(),
    page: z.string().default('1'),
    limit: z.string().default('10'),
  }),
});
