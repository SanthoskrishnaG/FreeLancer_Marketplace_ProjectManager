import { DashboardService } from '../services/dashboardService.js';
import { ApiResponse } from '../utils/api-response.js';

export class DashboardController {
  static async getClientDashboard(req, res, next) {
    try {
      const data = await DashboardService.getClientDashboard(req.user.id);
      return ApiResponse.success(res, data, 'Client dashboard metrics loaded');
    } catch (error) {
      next(error);
    }
  }

  static async getFreelancerDashboard(req, res, next) {
    try {
      const data = await DashboardService.getFreelancerDashboard(req.user.id);
      return ApiResponse.success(res, data, 'Freelancer dashboard metrics loaded');
    } catch (error) {
      next(error);
    }
  }
}
