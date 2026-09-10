import { z } from 'zod';
import { ExperienceLevel } from '@prisma/client';

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(2).max(50).optional(),
    lastName: z.string().trim().min(2).max(50).optional(),
    phoneNumber: z.string().trim().optional().nullable(),
    avatarUrl: z.string().trim().url().optional().nullable(),
    location: z.string().trim().max(100).optional().nullable(),

    // Client Profile specific fields
    companyName: z.string().trim().max(100).optional().nullable(),
    companyWebsite: z.string().trim().url().optional().nullable(),
    description: z.string().trim().max(2000).optional().nullable(),
    industry: z.string().trim().max(100).optional().nullable(),
    logoUrl: z.string().trim().url().optional().nullable(),

    // Freelancer Profile specific fields
    title: z.string().trim().max(120).optional().nullable(),
    bio: z.string().trim().max(3000).optional().nullable(),
    hourlyRate: z.number().min(5).max(1000).optional().nullable(),
    experienceYears: z.number().int().min(0).max(50).optional().nullable(),
    experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
    isAvailable: z.boolean().optional(),
    languages: z.array(z.string().trim()).optional(),
    portfolio: z
      .array(
        z.object({
          title: z.string().min(1),
          description: z.string().optional(),
          url: z.string().url().optional().or(z.literal('')),
          imageUrl: z.string().url().optional().or(z.literal('')),
        })
      )
      .optional(),
  }),
});

export const addFreelancerSkillSchema = z.object({
  body: z.object({
    skillId: z.string().uuid('Invalid skill identifier'),
    proficiency: z.enum(['Beginner', 'Intermediate', 'Expert']).default('Intermediate'),
  }),
});

export const freelancerQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    skill: z.string().optional(),
    experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
    minRate: z.string().optional(),
    maxRate: z.string().optional(),
    availableOnly: z.string().optional(),
    page: z.string().default('1'),
    limit: z.string().default('12'),
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
export type AddFreelancerSkillInput = z.infer<typeof addFreelancerSkillSchema>['body'];
