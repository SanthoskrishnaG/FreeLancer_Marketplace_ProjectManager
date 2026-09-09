import { MilestoneService } from '../services/milestoneService.js';
import { ApiResponse } from '../utils/api-response.js';

export class MilestoneController {
  static async getMilestoneById(req, res, next) {
    try {
      const milestone = await MilestoneService.getMilestoneById(req.params.id, req.user.id);
      return ApiResponse.success(res, milestone, 'Milestone retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async startMilestone(req, res, next) {
    try {
      const milestone = await MilestoneService.startMilestone(req.user.id, req.params.id);
      return ApiResponse.success(res, milestone, 'Milestone started');
    } catch (error) {
      next(error);
    }
  }
  static async getMilestonesByContract(req, res, next) {
    try {
      const milestones = await MilestoneService.getContractMilestones(req.params.contractId, req.user.id);
      return ApiResponse.success(res, milestones, 'Milestones retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async submitMilestoneWork(req, res, next) {
    try {
      const fileUrl = req.file ? `/uploads/${req.file.filename}` : req.body.fileUrl;
      const submission = await MilestoneService.submitMilestone(req.params.id, req.user.id, {
        notes: req.body.notes,
        fileUrl
      });
      return ApiResponse.success(res, submission, 'Milestone work submitted');
    } catch (error) {
      next(error);
    }
  }

  static async approveMilestone(req, res, next) {
    try {
      const approved = await MilestoneService.approveMilestone(req.params.id, req.user.id);
      return ApiResponse.success(res, approved, 'Milestone approved and payment released');
    } catch (error) {
      next(error);
    }
  }

  static async requestRevision(req, res, next) {
    try {
      const revision = await MilestoneService.requestRevision(req.params.id, req.user.id, req.body.revisionNotes);
      return ApiResponse.success(res, revision, 'Revision requested successfully');
    } catch (error) {
      next(error);
    }
  }
}
