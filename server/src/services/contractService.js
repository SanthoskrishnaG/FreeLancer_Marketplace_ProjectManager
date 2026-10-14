import { prisma } from '../config/database.js';
import { ContractRepository } from '../repositories/contract.repository.js';
import { ProfileRepository } from '../repositories/profile.repository.js';
import { ApiError } from '../utils/api-error.js';

export class ContractService {
  static async getUserContracts(userId, role, query = {}) {
    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user) throw ApiError.unauthorized('Authentication required');

    const filter = {
      status: query.status,
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 10,
    };

    if (user.role === 'CLIENT' && user.clientProfile) {
      filter.clientId = user.clientProfile.id;
    } else if (user.role === 'FREELANCER' && user.freelancerProfile) {
      filter.freelancerProfileId = user.freelancerProfile.id;
    }

    return ContractRepository.getUserContracts(filter);
  }

  static async getContracts(userId, role, query = {}) {
    return this.getUserContracts(userId, role, query);
  }

  static async getContractById(arg1, arg2) {
    let contractId = typeof arg1 === 'string' && arg1.length === 36 ? arg1 : arg2;
    let userId = contractId === arg1 ? arg2 : arg1;

    const contract = await ContractRepository.findContractById(contractId);
    if (!contract) throw ApiError.notFound('Contract not found');

    if (userId) {
      const user = await ProfileRepository.getUserFullProfile(userId);
      if (user) {
        const isClient = user.clientProfile && contract.clientId === user.clientProfile.id;
        const isFreelancer = user.freelancerProfile && contract.freelancerProfileId === user.freelancerProfile.id;
        const isAdmin = user.role === 'ADMIN';

        if (!isClient && !isFreelancer && !isAdmin) {
          throw ApiError.forbidden('You do not have permission to view this contract');
        }
      }
    }

    return contract;
  }

  static async completeContract(contractId, userId) {
    await this.getContractById(contractId, userId);
    return ContractRepository.updateContractStatus(contractId, 'COMPLETED');
  }

  static async cancelContract(contractId, userId, reason) {
    await this.getContractById(contractId, userId);
    return ContractRepository.updateContractStatus(contractId, 'CANCELLED');
  }
}

export default ContractService;
