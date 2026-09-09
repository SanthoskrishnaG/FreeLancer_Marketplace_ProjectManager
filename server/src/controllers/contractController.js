import { ContractService } from '../services/contractService.js';
import { ApiResponse } from '../utils/api-response.js';

export class ContractController {
  static async getUserContracts(req, res, next) {
    try {
      const contracts = await ContractService.getUserContracts(req.user.id, req.user.role, req.query);
      return ApiResponse.success(res, contracts, 'Contracts retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getContractById(req, res, next) {
    try {
      const contract = await ContractService.getContractById(req.params.id, req.user.id, req.user.role);
      return ApiResponse.success(res, contract, 'Contract retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async completeContract(req, res, next) {
    try {
      const completed = await ContractService.completeContract(req.params.id, req.user.id);
      return ApiResponse.success(res, completed, 'Contract marked as completed');
    } catch (error) {
      next(error);
    }
  }

  static async cancelContract(req, res, next) {
    try {
      const cancelled = await ContractService.cancelContract(req.params.id, req.user.id, req.body.reason);
      return ApiResponse.success(res, cancelled, 'Contract cancelled');
    } catch (error) {
      next(error);
    }
  }
}
