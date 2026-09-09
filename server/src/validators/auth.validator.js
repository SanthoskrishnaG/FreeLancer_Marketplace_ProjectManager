import { z } from 'zod';

export const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    role: z.enum(['CLIENT', 'FREELANCER'], {
      errorMap: () => ({ message: 'Role must be either CLIENT or FREELANCER' }),
    }),
    companyName: z.string().optional(),
    title: z.string().optional(),
    hourlyRate: z.number().optional(),
  })
  .refine(
    (data) => data.name || (data.firstName && data.lastName),
    {
      message: 'Please provide either full name or both first and last name',
      path: ['name'],
    }
  );

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});
