import { Request, Response, NextFunction } from 'express';
import { ContractService } from '../services/contract.service.js';
import { ApiResponse } from '../utils/api-response.js';
import { ApiError } from '../utils/api-error.js';

export class ContractController {
  public static async getMyContracts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      const result = await ContractService.getMyContracts(req.user.userId, req.query as any);
      res.status(200).json(ApiResponse.success(result, 'Contracts retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  public static async getContractById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      const contract = await ContractService.getContractById(
        req.user.userId,
        req.params.id as string
      );
      res.status(200).json(ApiResponse.success(contract, 'Contract details retrieved'));
    } catch (error) {
      next(error);
    }
  }

  public static async updateContractStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      const contract = await ContractService.updateContractStatus(
        req.user.userId,
        req.params.id as string,
        req.body.status
      );
      res
        .status(200)
        .json(ApiResponse.success(contract, `Contract status updated to ${req.body.status}`));
    } catch (error) {
      next(error);
    }
  }
}
