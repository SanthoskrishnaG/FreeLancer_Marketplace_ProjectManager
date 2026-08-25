import { ContractRepository } from '../repositories/contract.repository.js';
import { ProfileRepository } from '../repositories/profile.repository.js';
import { ApiError } from '../utils/api-error.js';
import { ContractStatus, UserRole } from '@prisma/client';

export class ContractService {
  public static async getMyContracts(
    userId: string,
    query: { status?: ContractStatus; page?: string; limit?: string }
  ) {
    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);

    if (user.role === UserRole.CLIENT && user.clientProfile) {
      return ContractRepository.getUserContracts({
        clientId: user.clientProfile.id,
        status: query.status,
        page,
        limit,
      });
    }

    if (user.role === UserRole.FREELANCER && user.freelancerProfile) {
      return ContractRepository.getUserContracts({
        freelancerProfileId: user.freelancerProfile.id,
        status: query.status,
        page,
        limit,
      });
    }

    if (user.role === UserRole.ADMIN) {
      return ContractRepository.getUserContracts({
        status: query.status,
        page,
        limit,
      });
    }

    return {
      contracts: [],
      pagination: { total: 0, page: 1, limit, totalPages: 0 },
    };
  }

  public static async getContractById(userId: string, contractId: string) {
    const contract = await ContractRepository.findContractById(contractId);
    if (!contract) {
      throw ApiError.notFound('Contract not found');
    }

    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const isClient = user.clientProfile && contract.clientId === user.clientProfile.id;
    const isFreelancer =
      user.freelancerProfile && contract.freelancerProfileId === user.freelancerProfile.id;
    const isAdmin = user.role === UserRole.ADMIN;

    if (!isClient && !isFreelancer && !isAdmin) {
      throw ApiError.forbidden('You do not have access to view this contract');
    }

    const totalMilestones = contract.milestones.length;
    const completedMilestones = contract.milestones.filter(
      (m) => m.status === 'COMPLETED' || m.status === 'APPROVED'
    ).length;
    const progressPercentage =
      totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    return {
      ...contract,
      totalMilestones,
      completedMilestones,
      progressPercentage,
    };
  }

  public static async updateContractStatus(
    userId: string,
    contractId: string,
    status: ContractStatus
  ) {
    const contract = await ContractRepository.findContractById(contractId);
    if (!contract) {
      throw ApiError.notFound('Contract not found');
    }

    const user = await ProfileRepository.getUserFullProfile(userId);
    if (!user || !user.clientProfile || contract.clientId !== user.clientProfile.id) {
      if (user?.role !== UserRole.ADMIN) {
        throw ApiError.forbidden('Only the client owner or an admin can manage contract status');
      }
    }

    return ContractRepository.updateContractStatus(contractId, status);
  }
}
