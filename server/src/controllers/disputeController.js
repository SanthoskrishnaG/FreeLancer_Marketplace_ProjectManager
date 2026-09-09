import { DisputeService } from '../services/disputeService.js';
import { ApiResponse } from '../utils/api-response.js';

export class DisputeController {
  static async createDispute(req, res, next) {
    try {
      const dispute = await DisputeService.createDispute(req.user.id, req.body);
      return ApiResponse.created(res, dispute, 'Dispute filed successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getUserDisputes(req, res, next) {
    try {
      const disputes = await DisputeService.getUserDisputes(req.user.id);
      return ApiResponse.success(res, disputes, 'User disputes retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getDisputeById(req, res, next) {
    try {
      const dispute = await DisputeService.getDisputeById(req.params.id, req.user.id, req.user.role);
      return ApiResponse.success(res, dispute, 'Dispute details retrieved');
    } catch (error) {
      next(error);
    }
  }
}
