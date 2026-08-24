import { ProfileRepository } from '../repositories/profile.repository.js';
import { ApiError } from '../utils/api-error.js';
import { UpdateProfileInput, AddFreelancerSkillInput } from '../validators/profile.validator.js';
import { ExperienceLevel } from '@prisma/client';

export class ProfileService {
  public static async getMyProfile(userId: string) {
    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    const { passwordHash: _hash, refreshToken: _rf, resetPasswordToken: _rpt, ...sanitized } = user;
    return sanitized;
  }

  public static async updateMyProfile(userId: string, data: UpdateProfileInput) {
    const updated = await ProfileRepository.updateUserProfile(userId, data);
    const {
      passwordHash: _hash,
      refreshToken: _rf,
      resetPasswordToken: _rpt,
      ...sanitized
    } = updated;
    return sanitized;
  }

  public static async listFreelancers(query: {
    search?: string;
    skill?: string;
    experienceLevel?: ExperienceLevel;
    minRate?: string;
    maxRate?: string;
    availableOnly?: string;
    page: string;
    limit: string;
  }) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '12', 10);
    const minRate = query.minRate ? parseFloat(query.minRate) : undefined;
    const maxRate = query.maxRate ? parseFloat(query.maxRate) : undefined;
    const availableOnly = query.availableOnly === 'true';

    return ProfileRepository.getFreelancers({
      search: query.search,
      skill: query.skill,
      experienceLevel: query.experienceLevel,
      minRate,
      maxRate,
      availableOnly,
      page,
      limit,
    });
  }

  public static async getFreelancerById(id: string) {
    const freelancer = await ProfileRepository.getFreelancerById(id);
    if (!freelancer) {
      throw ApiError.notFound('Freelancer profile not found');
    }
    return freelancer;
  }

  public static async addFreelancerSkill(userId: string, data: AddFreelancerSkillInput) {
    return ProfileRepository.addSkillToFreelancer(userId, data.skillId, data.proficiency);
  }

  public static async removeFreelancerSkill(userId: string, skillId: string) {
    await ProfileRepository.removeSkillFromFreelancer(userId, skillId);
    return { success: true };
  }

  public static async getSkillsAndCategories() {
    const [skills, categories] = await Promise.all([
      ProfileRepository.getAllSkills(),
      ProfileRepository.getAllCategories(),
    ]);
    return { skills, categories };
  }
}
