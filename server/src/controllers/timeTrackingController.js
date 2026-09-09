import { TimeTrackingService } from '../services/timeTrackingService.js';
import { ApiResponse } from '../utils/api-response.js';

export class TimeTrackingController {
  static async startTimer(req, res, next) {
    try {
      const entry = await TimeTrackingService.startTimer(req.user.id, req.body);
      return ApiResponse.created(res, entry, 'Timer started');
    } catch (error) {
      next(error);
    }
  }

  static async stopTimer(req, res, next) {
    try {
      const entry = await TimeTrackingService.stopTimer(req.user.id, req.params.id);
      return ApiResponse.success(res, entry, 'Timer stopped and duration logged');
    } catch (error) {
      next(error);
    }
  }

  static async createManualEntry(req, res, next) {
    try {
      const entry = await TimeTrackingService.createManualEntry(req.user.id, req.body);
      return ApiResponse.created(res, entry, 'Manual time entry created');
    } catch (error) {
      next(error);
    }
  }

  static async getContractTimeEntries(req, res, next) {
    try {
      const entries = await TimeTrackingService.getContractTimeEntries(req.params.contractId, req.user.id);
      return ApiResponse.success(res, entries, 'Contract time entries retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getFreelancerTimeSummary(req, res, next) {
    try {
      const summary = await TimeTrackingService.getFreelancerTimeSummary(req.user.id);
      return ApiResponse.success(res, summary, 'Freelancer time summary retrieved');
    } catch (error) {
      next(error);
    }
  }
}
