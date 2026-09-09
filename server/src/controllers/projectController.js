import { ProjectService } from '../services/projectService.js';
import { AiProjectAnalysisService } from '../services/aiProjectAnalysisService.js';
import { ApiResponse } from '../utils/api-response.js';

export class ProjectController {
  static async createProject(req, res, next) {
    try {
      const project = await ProjectService.createProject(req.user.id, req.body);
      return ApiResponse.created(res, project, 'Project created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getProjects(req, res, next) {
    try {
      const result = await ProjectService.getProjects(req.query);
      return ApiResponse.success(res, result, 'Projects retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getProjectById(req, res, next) {
    try {
      const project = await ProjectService.getProjectById(req.params.id);
      return ApiResponse.success(res, project, 'Project details retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getClientProjects(req, res, next) {
    try {
      const result = await ProjectService.getClientProjects(req.user.id, req.query);
      return ApiResponse.success(res, result, 'Client projects retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async updateProject(req, res, next) {
    try {
      const updated = await ProjectService.updateProject(req.params.id, req.user.id, req.body);
      return ApiResponse.success(res, updated, 'Project updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteProject(req, res, next) {
    try {
      const deleted = await ProjectService.deleteProject(req.params.id, req.user.id);
      return ApiResponse.success(res, deleted, 'Project deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getCategories(req, res, next) {
    try {
      const categories = await ProjectService.getCategories();
      return ApiResponse.success(res, categories, 'Categories retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getSkills(req, res, next) {
    try {
      const skills = await ProjectService.getSkills();
      return ApiResponse.success(res, skills, 'Skills retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async analyzeRequirementsWithAi(req, res, next) {
    try {
      const { description, category, budget } = req.body;
      const analysis = await AiProjectAnalysisService.analyzeRequirements({ description, category, budget });
      return ApiResponse.success(res, analysis, 'AI requirement analysis completed');
    } catch (error) {
      next(error);
    }
  }

  static async generateMilestonesWithAi(req, res, next) {
    try {
      const { title, description, budget, durationWeeks } = req.body;
      const milestones = await AiProjectAnalysisService.generateMilestones({
        title,
        description,
        budget: Number(budget),
        durationWeeks: Number(durationWeeks || 4)
      });
      return ApiResponse.success(res, milestones, 'AI milestones generated');
    } catch (error) {
      next(error);
    }
  }
}
