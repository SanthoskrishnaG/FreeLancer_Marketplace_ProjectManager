import { prisma } from '../config/database.js';
import { ProjectRepository } from '../repositories/project.repository.js';
import { ProfileRepository } from '../repositories/profile.repository.js';
import { FolderRepository } from '../repositories/folder.repository.js';
import { ApiError } from '../utils/api-error.js';

export class ProjectService {
  static async createProject(userId, data) {
    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user || !user.clientProfile) {
      throw ApiError.forbidden('Only registered client accounts can create projects');
    }

    return ProjectRepository.createProject(user.clientProfile.id, data);
  }

  static async getProjects(query = {}) {
    const result = await ProjectRepository.getPublicMarketplaceProjects(query);
    return {
      ...result,
      items: result.projects,
    };
  }

  static async getProjectById(id) {
    const project = await ProjectRepository.getProjectById(id);
    if (!project) {
      throw ApiError.notFound('Project not found');
    }
    return project;
  }

  static async getClientProjects(userId) {
    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    if (user.clientProfile) {
      return ProjectRepository.getClientProjects(user.clientProfile.id);
    }

    if (user.freelancerProfile) {
      return ProjectRepository.getFreelancerProjects(user.freelancerProfile.id);
    }

    throw ApiError.forbidden('Client or Freelancer profile not found');
  }

  static async createProjectIdea(userId, data) {
    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user || !user.freelancerProfile) {
      throw ApiError.forbidden('Only registered freelancer accounts can create project ideas');
    }

    if (data.categoryId) {
      const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
      if (!category) {
        throw ApiError.badRequest('Invalid category selected');
      }
    }

    // Validate budget vs milestones
    if (data.milestones && data.milestones.length > 0) {
      const totalMilestones = data.milestones.reduce((sum, m) => sum + Number(m.amount || 0), 0);
      const budgetNum = Number(data.budget);
      if (budgetNum && totalMilestones > budgetNum) {
        throw ApiError.badRequest(`Total milestone amount (₹${totalMilestones.toLocaleString('en-IN')}) cannot exceed project budget (₹${budgetNum.toLocaleString('en-IN')})`);
      }
    }

    return ProjectRepository.createProjectIdea(user.freelancerProfile.id, data);
  }

  static async getFreelancerProjectIdeas(userId) {
    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user || !user.freelancerProfile) {
      throw ApiError.forbidden('Freelancer profile not found');
    }

    return ProjectRepository.getFreelancerProjects(user.freelancerProfile.id);
  }

  static async getCategories() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { projects: true, skills: true } },
      },
    });
  }

  static async getSkills() {
    return prisma.skill.findMany({
      orderBy: { name: 'asc' },
      include: {
        category: { select: { id: true, name: true } },
      },
    });
  }

  static async updateProject(projectId, userId, data) {
    const project = await ProjectRepository.getProjectById(projectId);
    if (!project) throw ApiError.notFound('Project not found');

    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user) throw ApiError.unauthorized('User not found');
    const isOwner =
      (user.clientProfile && project.clientId === user.clientProfile.id) ||
      (user.freelancerProfile && project.freelancerId === user.freelancerProfile.id);
    const isAdmin = user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      throw ApiError.forbidden('You do not have permission to modify this project');
    }

    return ProjectRepository.updateProject(projectId, data);
  }

  static async deleteProject(projectId, userId) {
    const project = await ProjectRepository.getProjectById(projectId);
    if (!project) throw ApiError.notFound('Project not found');

    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user) throw ApiError.unauthorized('User not found');
    const isOwner =
      (user.clientProfile && project.clientId === user.clientProfile.id) ||
      (user.freelancerProfile && project.freelancerId === user.freelancerProfile.id);
    const isAdmin = user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      throw ApiError.forbidden('You do not have permission to delete this project');
    }

    return prisma.project.delete({ where: { id: projectId } });
  }

  // ----------------------------------------------------
  // Project Folders & Records
  // ----------------------------------------------------

  static async getProjectFolders(projectId, userId) {
    const project = await ProjectRepository.getProjectById(projectId);
    if (!project) throw ApiError.notFound('Project not found');

    return FolderRepository.getFoldersByProjectId(projectId);
  }

  static async createProjectFolder(projectId, userId, data) {
    const project = await ProjectRepository.getProjectById(projectId);
    if (!project) throw ApiError.notFound('Project not found');

    if (!data.name || !data.name.trim()) {
      throw ApiError.badRequest('Folder name is required');
    }

    const existing = await FolderRepository.findByName(projectId, data.name.trim());
    if (existing) {
      throw ApiError.conflict(`A folder named "${data.name.trim()}" already exists in this project`);
    }

    return FolderRepository.createFolder({
      projectId,
      name: data.name.trim(),
      createdById: userId,
    });
  }

  static async deleteProjectFolder(projectId, folderId, userId) {
    const folder = await FolderRepository.getFolderById(folderId);
    if (!folder || folder.projectId !== projectId) {
      throw ApiError.notFound('Folder not found in this project');
    }

    const project = await ProjectRepository.getProjectById(projectId);
    const user = await ProfileRepository.getUserFullProfile(userId);
    const isProjectOwner = user?.clientProfile && project?.clientId === user.clientProfile.id;
    const isFolderCreator = folder.createdById === userId;
    const isAdmin = user?.role === 'ADMIN';

    if (!isProjectOwner && !isFolderCreator && !isAdmin) {
      throw ApiError.forbidden('You do not have permission to delete this folder');
    }

    await FolderRepository.deleteFolder(folderId);
    return { success: true, message: 'Folder deleted successfully' };
  }

  static async addProjectFile(projectId, folderId, userId, fileData) {
    const folder = await FolderRepository.getFolderById(folderId);
    if (!folder || folder.projectId !== projectId) {
      throw ApiError.notFound('Folder not found in this project');
    }

    if (!fileData.name || !fileData.name.trim()) {
      throw ApiError.badRequest('File name is required');
    }

    return FolderRepository.addFileToFolder({
      folderId,
      name: fileData.name.trim(),
      url: fileData.url || '#',
      size: fileData.size ? Number(fileData.size) : null,
      mimeType: fileData.mimeType || 'application/octet-stream',
    });
  }

  static async deleteProjectFile(projectId, folderId, fileId, userId) {
    const file = await FolderRepository.getFileById(fileId);
    if (!file || file.folderId !== folderId) {
      throw ApiError.notFound('File not found in this folder');
    }

    await FolderRepository.deleteFile(fileId);
    return { success: true, message: 'File deleted successfully' };
  }
}

