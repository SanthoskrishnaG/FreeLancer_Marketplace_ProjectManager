import { ProjectRepository } from '../repositories/project.repository.js';
import { ProfileRepository } from '../repositories/profile.repository.js';
import { AIRequirementService } from './ai-requirement.service.js';
import { ApiError } from '../utils/api-error.js';
import {
  CreateProjectInput,
  UpdateProjectInput,
  BatchMilestoneItem,
} from '../validators/project.validator.js';
import { ProjectStatus, ExperienceLevel } from '@prisma/client';

export class ProjectService {
  public static async createProject(userId: string, data: CreateProjectInput) {
    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user || !user.clientProfile) {
      throw ApiError.forbidden('Only registered client accounts can create projects');
    }

    return ProjectRepository.createProject(user.clientProfile.id, data);
  }

  public static async updateProject(userId: string, projectId: string, data: UpdateProjectInput) {
    const project = await ProjectRepository.getProjectById(projectId);
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user || !user.clientProfile || project.clientId !== user.clientProfile.id) {
      throw ApiError.forbidden('You do not have permission to modify this project');
    }

    if (project.status === ProjectStatus.COMPLETED || project.status === ProjectStatus.ARCHIVED) {
      throw ApiError.badRequest(`Cannot update project in ${project.status} state`);
    }

    return ProjectRepository.updateProject(projectId, data);
  }

  public static async deleteDraftProject(userId: string, projectId: string) {
    const project = await ProjectRepository.getProjectById(projectId);
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user || !user.clientProfile || project.clientId !== user.clientProfile.id) {
      throw ApiError.forbidden('You do not have permission to delete this project');
    }

    if (project.status !== ProjectStatus.DRAFT) {
      throw ApiError.badRequest('Only DRAFT projects can be deleted');
    }

    await ProjectRepository.deleteProject(projectId);
    return { success: true, message: 'Project draft deleted successfully' };
  }

  public static async updateProjectStatus(
    userId: string,
    projectId: string,
    newStatus: ProjectStatus
  ) {
    const project = await ProjectRepository.getProjectById(projectId);
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user || !user.clientProfile || project.clientId !== user.clientProfile.id) {
      throw ApiError.forbidden('You do not have permission to change this project status');
    }

    return ProjectRepository.updateProject(projectId, { status: newStatus as any });
  }

  public static async getClientProjects(userId: string, status?: ProjectStatus) {
    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user || !user.clientProfile) {
      throw ApiError.forbidden('Only clients have created projects');
    }

    return ProjectRepository.getClientProjects(user.clientProfile.id, status);
  }

  public static async getPublicMarketplaceProjects(params: {
    search?: string;
    category?: string;
    skill?: string;
    budgetType?: string;
    minBudget?: string;
    maxBudget?: string;
    experienceLevel?: ExperienceLevel;
    status?: ProjectStatus;
    sortBy: 'newest' | 'budget_high' | 'budget_low' | 'deadline';
    page: string;
    limit: string;
    currentUserId?: string;
  }) {
    const page = parseInt(params.page || '1', 10);
    const limit = parseInt(params.limit || '10', 10);
    const minBudget = params.minBudget ? parseFloat(params.minBudget) : undefined;
    const maxBudget = params.maxBudget ? parseFloat(params.maxBudget) : undefined;

    return ProjectRepository.getPublicMarketplaceProjects({
      search: params.search,
      category: params.category,
      skill: params.skill,
      budgetType: params.budgetType,
      minBudget,
      maxBudget,
      experienceLevel: params.experienceLevel,
      status: params.status,
      sortBy: params.sortBy,
      page,
      limit,
      currentUserId: params.currentUserId,
    });
  }

  public static async getProjectDetails(projectId: string, currentUserId?: string) {
    const project = await ProjectRepository.getProjectById(projectId, currentUserId);
    if (!project) {
      throw ApiError.notFound('Project not found');
    }
    return project;
  }

  public static async toggleProjectBookmark(userId: string, projectId: string) {
    const project = await ProjectRepository.getProjectById(projectId);
    if (!project) {
      throw ApiError.notFound('Project not found');
    }
    return ProjectRepository.toggleBookmark(userId, projectId);
  }

  public static async getUserBookmarks(userId: string) {
    return ProjectRepository.getUserBookmarks(userId);
  }

  public static async generateMilestonesForProject(
    userId: string,
    projectId: string,
    customPrompt?: string
  ) {
    const project = await ProjectRepository.getProjectById(projectId);
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user || !user.clientProfile || project.clientId !== user.clientProfile.id) {
      throw ApiError.forbidden('Only the project owner can generate milestones');
    }

    const totalBudget = Number(project.budget) || 1000;

    return AIRequirementService.generateMilestones({
      projectTitle: project.title,
      projectDescription: project.description,
      projectRequirements: project.requirements,
      totalBudget,
      customPrompt,
    });
  }

  public static async saveBatchMilestones(
    userId: string,
    projectId: string,
    milestones: BatchMilestoneItem[]
  ) {
    const project = await ProjectRepository.getProjectById(projectId);
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user || !user.clientProfile || project.clientId !== user.clientProfile.id) {
      throw ApiError.forbidden('Only the project owner can save milestones');
    }

    await ProjectRepository.saveProjectMilestones(projectId, milestones);

    return ProjectRepository.getProjectById(projectId);
  }
}
