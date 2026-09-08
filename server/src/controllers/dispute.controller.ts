import { Request, Response, NextFunction } from 'express';
import { DisputeService } from '../services/dispute.service.js';
import { ApiResponse } from '../utils/api-response.js';

export class DisputeController {
  public static async createDispute(req: Request, res: Response, next: NextFunction) {
    try {
      const dispute = await DisputeService.createDispute(req.user!.id, req.body);
      return res.status(201).json(ApiResponse.success(dispute, 'Dispute opened successfully'));
    } catch (error) {
      next(error);
    }
  }

  public static async getDisputes(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await DisputeService.getDisputes(req.user!.id, req.query);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }

  public static async getDisputeById(req: Request, res: Response, next: NextFunction) {
    try {
      const dispute = await DisputeService.getDisputeById(req.user!.id, req.params.id);
      return res.status(200).json(ApiResponse.success(dispute));
    } catch (error) {
      next(error);
    }
  }

  public static async addMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const message = await DisputeService.addDisputeMessage(
        req.user!.id,
        req.params.id,
        req.body
      );
      return res.status(201).json(ApiResponse.success(message, 'Message posted to dispute'));
    } catch (error) {
      next(error);
    }
  }

  public static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };
      const updated = await DisputeService.updateDisputeStatus(
        req.user!.id,
        req.params.id,
        req.body,
        metadata
      );
      return res.status(200).json(ApiResponse.success(updated, 'Dispute status updated'));
    } catch (error) {
      next(error);
    }
  }

  public static async resolveDispute(req: Request, res: Response, next: NextFunction) {
    try {
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };
      const resolved = await DisputeService.resolveDispute(
        req.user!.id,
        req.params.id,
        req.body,
        metadata
      );
      return res.status(200).json(ApiResponse.success(resolved, 'Dispute marked as RESOLVED'));
    } catch (error) {
      next(error);
    }
  }

  public static async rejectDispute(req: Request, res: Response, next: NextFunction) {
    try {
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };
      const rejected = await DisputeService.rejectDispute(
        req.user!.id,
        req.params.id,
        req.body,
        metadata
      );
      return res.status(200).json(ApiResponse.success(rejected, 'Dispute marked as REJECTED'));
    } catch (error) {
      next(error);
    }
  }

  public static async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const logs = await DisputeService.getDisputeAuditLogs(req.user!.id, req.params.id);
      return res.status(200).json(ApiResponse.success(logs));
    } catch (error) {
      next(error);
    }
  }
}
