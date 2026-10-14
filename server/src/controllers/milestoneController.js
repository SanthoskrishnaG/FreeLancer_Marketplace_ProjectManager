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
      const links = req.body.links ? (Array.isArray(req.body.links) ? req.body.links : [req.body.links]) : [];
      if (fileUrl) links.push(fileUrl);
      const submission = await MilestoneService.submitMilestone(req.user.id, req.params.id, {
        description: req.body.description || req.body.notes || 'Milestone work submitted',
        notes: req.body.notes,
        links,
        fileUrl
      });
      return ApiResponse.created(res, submission, 'Milestone work submitted');
    } catch (error) {
      next(error);
    }
  }

  static async approveMilestone(req, res, next) {
    try {
      const approved = await MilestoneService.approveMilestone(req.user.id, req.params.id);
      return ApiResponse.success(res, approved, 'Milestone approved and payment released');
    } catch (error) {
      next(error);
    }
  }

  static async requestRevision(req, res, next) {
    try {
      const feedback = typeof req.body.revisionNotes === 'string'
        ? req.body.revisionNotes
        : (req.body.feedback || 'Revision requested');
      const revision = await MilestoneService.requestRevision(req.user.id, req.params.id, {
        feedback,
        requestedChanges: req.body.requestedChanges || [feedback],
        dueDate: req.body.dueDate
      });
      return ApiResponse.created(res, revision, 'Revision requested successfully');
    } catch (error) {
      next(error);
    }
  }
}
