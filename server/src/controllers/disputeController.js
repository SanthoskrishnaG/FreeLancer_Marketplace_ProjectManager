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
      const disputes = await DisputeService.getUserDisputes(req.user.id, req.query);
      return ApiResponse.success(res, disputes, 'User disputes retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getDisputeById(req, res, next) {
    try {
      const dispute = await DisputeService.getDisputeById(req.params.id, req.user.id);
      return ApiResponse.success(res, dispute, 'Dispute details retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async addMessage(req, res, next) {
    try {
      const message = await DisputeService.addDisputeMessage(req.user.id, req.params.id, req.body);
      return ApiResponse.created(res, message, 'Dispute message posted');
    } catch (error) {
      next(error);
    }
  }

  static async resolveDispute(req, res, next) {
    try {
      const resolved = await DisputeService.resolveDispute(req.user.id, req.params.id, req.body);
      return ApiResponse.success(res, resolved, 'Dispute resolved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async rejectDispute(req, res, next) {
    try {
      const rejected = await DisputeService.rejectDispute(req.user.id, req.params.id, req.body);
      return ApiResponse.success(res, rejected, 'Dispute rejected successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default DisputeController;
