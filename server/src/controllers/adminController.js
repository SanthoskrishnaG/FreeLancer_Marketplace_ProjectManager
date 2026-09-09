import { AdminService } from '../services/adminService.js';
import { ApiResponse } from '../utils/api-response.js';

export class AdminController {
  static async getOverview(req, res, next) {
    try {
      const data = await AdminService.getDashboardOverview();
      return ApiResponse.success(res, data, 'Admin dashboard overview loaded');
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(req, res, next) {
    try {
      const data = await AdminService.getUsers(req.query);
      return ApiResponse.success(res, data, 'Users retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async updateUserStatus(req, res, next) {
    try {
      const { status, reason } = req.body;
      const updated = await AdminService.updateUserStatus(req.params.id, status, reason, req.user.id);
      return ApiResponse.success(res, updated, 'User status updated');
    } catch (error) {
      next(error);
    }
  }

  static async getFreelancers(req, res, next) {
    try {
      const data = await AdminService.getFreelancers(req.query);
      return ApiResponse.success(res, data, 'Freelancer profiles retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async verifyFreelancer(req, res, next) {
    try {
      const { isVerified } = req.body;
      const updated = await AdminService.verifyFreelancer(req.params.id, isVerified, req.user.id);
      return ApiResponse.success(res, updated, 'Freelancer verification status updated');
    } catch (error) {
      next(error);
    }
  }

  static async getProjects(req, res, next) {
    try {
      const data = await AdminService.getProjects(req.query);
      return ApiResponse.success(res, data, 'Projects retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async updateProjectStatus(req, res, next) {
    try {
      const { status } = req.body;
      const updated = await AdminService.updateProjectStatus(req.params.id, status, req.user.id);
      return ApiResponse.success(res, updated, 'Project status updated');
    } catch (error) {
      next(error);
    }
  }

  static async getContracts(req, res, next) {
    try {
      const data = await AdminService.getContracts(req.query);
      return ApiResponse.success(res, data, 'Contracts retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getDisputes(req, res, next) {
    try {
      const data = await AdminService.getDisputes(req.query);
      return ApiResponse.success(res, data, 'Disputes retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async resolveDispute(req, res, next) {
    try {
      const resolved = await AdminService.resolveDispute(req.params.id, req.body, req.user.id);
      return ApiResponse.success(res, resolved, 'Dispute resolved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getCategories(req, res, next) {
    try {
      const data = await AdminService.getCategories();
      return ApiResponse.success(res, data, 'Categories retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req, res, next) {
    try {
      const category = await AdminService.createCategory(req.body, req.user.id);
      return ApiResponse.created(res, category, 'Category created');
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req, res, next) {
    try {
      const category = await AdminService.updateCategory(req.params.id, req.body, req.user.id);
      return ApiResponse.success(res, category, 'Category updated');
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req, res, next) {
    try {
      const deleted = await AdminService.deleteCategory(req.params.id, req.user.id);
      return ApiResponse.success(res, deleted, 'Category deleted');
    } catch (error) {
      next(error);
    }
  }

  static async getSkills(req, res, next) {
    try {
      const data = await AdminService.getSkills();
      return ApiResponse.success(res, data, 'Skills retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async createSkill(req, res, next) {
    try {
      const skill = await AdminService.createSkill(req.body, req.user.id);
      return ApiResponse.created(res, skill, 'Skill created');
    } catch (error) {
      next(error);
    }
  }

  static async deleteSkill(req, res, next) {
    try {
      const deleted = await AdminService.deleteSkill(req.params.id, req.user.id);
      return ApiResponse.success(res, deleted, 'Skill deleted');
    } catch (error) {
      next(error);
    }
  }

  static async getAuditLogs(req, res, next) {
    try {
      const data = await AdminService.getAuditLogs(req.query);
      return ApiResponse.success(res, data, 'Audit logs retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getAnalytics(req, res, next) {
    try {
      const data = await AdminService.getPlatformAnalytics();
      return ApiResponse.success(res, data, 'Platform analytics retrieved');
    } catch (error) {
      next(error);
    }
  }
}
