import { prisma } from '../config/database.js';
import { ApiError } from '../utils/api-error.js';

export class DashboardService {
  static getLastNMonths(n = 6) {
    const months = [];
    const now = new Date();

    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      months.push({ key, label });
    }

    return months;
  }

  static async getClientDashboard(userId) {
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    if (!clientProfile) {
      throw ApiError.notFound('Client profile not found');
    }

    const clientId = clientProfile.id;

    const [
      activeProjectsCount,
      draftProjectsCount,
      completedProjectsCount,
      pendingProposalsCount,
      activeContractsCount,
      pendingMilestonesCount,
      openDisputesCount,
      completedPayments,
      allClientProjects,
      allMilestones,
      recentProjects,
      recentProposals,
      activeContracts,
      upcomingMilestones,
      notifications,
    ] = await Promise.all([
      // 1. Active projects (PUBLISHED or IN_PROGRESS)
      prisma.project.count({
        where: { clientId, status: { in: ['PUBLISHED', 'IN_PROGRESS'] } },
      }),
      // 2. Draft projects
      prisma.project.count({
        where: { clientId, status: 'DRAFT' },
      }),
      // 3. Completed projects
      prisma.project.count({
        where: { clientId, status: 'COMPLETED' },
      }),
      // 4. Pending proposals
      prisma.proposal.count({
        where: { project: { clientId }, status: 'PENDING' },
      }),
      // 5. Active contracts
      prisma.contract.count({
        where: { clientId, status: 'ACTIVE' },
      }),
      // 6. Pending milestone approvals
      prisma.milestone.count({
        where: { contract: { clientId }, status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
      }),
      // 7. Open disputes
      prisma.dispute.count({
        where: { contract: { clientId }, status: { in: ['OPEN', 'UNDER_REVIEW'] } },
      }),
      // 8. Completed payments
      prisma.payment.findMany({
        where: { contract: { clientId }, status: 'SUCCESS' },
        select: { amount: true, createdAt: true },
      }),
      // All projects for status chart
      prisma.project.findMany({
        where: { clientId },
        select: { status: true },
      }),
      // All milestones for milestone chart
      prisma.milestone.findMany({
        where: { contract: { clientId } },
        select: { status: true },
      }),
      // Recent projects
      prisma.project.findMany({
        where: { clientId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { category: true, _count: { select: { proposals: true } } },
      }),
      // Recent proposals
      prisma.proposal.findMany({
        where: { project: { clientId }, status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          project: { select: { id: true, title: true } },
          freelancerProfile: {
            include: {
              user: { select: { firstName: true, lastName: true, avatarUrl: true } },
            },
          },
        },
      }),
      // Active contracts
      prisma.contract.findMany({
        where: { clientId, status: 'ACTIVE' },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: {
          project: { select: { id: true, title: true } },
          freelancerProfile: {
            include: {
              user: { select: { firstName: true, lastName: true } },
            },
          },
          milestones: true,
        },
      }),
      // Upcoming deadlines
      prisma.milestone.findMany({
        where: {
          contract: { clientId },
          dueDate: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          status: { in: ['PENDING', 'IN_PROGRESS', 'SUBMITTED'] },
        },
        orderBy: { dueDate: 'asc' },
        take: 5,
        include: {
          contract: { select: { id: true, project: { select: { title: true } } } },
        },
      }),
      // Notifications
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    // Total spending
    const totalSpending = completedPayments.reduce((acc, p) => acc + Number(p.amount), 0);

    // 1. Spending over time chart
    const months = this.getLastNMonths(6);
    const spendingMap = {};
    months.forEach((m) => {
      spendingMap[m.key] = 0;
    });

    completedPayments.forEach((p) => {
      const d = new Date(p.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (spendingMap[key] !== undefined) {
        spendingMap[key] += Number(p.amount);
      }
    });

    const spendingOverTime = months.map((m) => ({
      month: m.key,
      label: m.label,
      spending: Number(spendingMap[m.key].toFixed(2)),
    }));

    // 2. Project status chart
    const statusCounts = {};
    allClientProjects.forEach((p) => {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
    });

    const statusPalette = {
      PUBLISHED: '#38bdf8',
      IN_PROGRESS: '#34d399',
      COMPLETED: '#a78bfa',
      DRAFT: '#94a3b8',
      CANCELLED: '#f87171',
      DISPUTED: '#fbbf24',
    };

    const projectStatusChart = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      fill: statusPalette[status] || '#64748b',
    }));

    // 3. Milestone completion chart
    const milestoneCounts = {};
    allMilestones.forEach((m) => {
      milestoneCounts[m.status] = (milestoneCounts[m.status] || 0) + 1;
    });

    const milestonePalette = {
      COMPLETED: '#34d399',
      APPROVED: '#10b981',
      SUBMITTED: '#38bdf8',
      UNDER_REVIEW: '#fbbf24',
      IN_PROGRESS: '#60a5fa',
      PENDING: '#94a3b8',
      REVISION_REQUESTED: '#f87171',
    };

    const milestoneCompletionChart = Object.entries(milestoneCounts).map(([status, count]) => ({
      status,
      count,
      fill: milestonePalette[status] || '#64748b',
    }));

    // Formatted deadlines
    const now = new Date();
    const formattedDeadlines = upcomingMilestones.map((m) => {
      const due = m.dueDate ? new Date(m.dueDate) : null;
      const diffMs = due ? due.getTime() - now.getTime() : 0;
      const daysRemaining = due ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : null;
      return {
        id: m.id,
        title: m.title,
        dueDate: m.dueDate,
        daysRemaining,
        isOverdue: daysRemaining !== null && daysRemaining < 0,
        projectTitle: m.contract?.project?.title || 'Contract Deliverable',
        contractId: m.contractId,
      };
    });

    const totalProjects = activeProjectsCount + draftProjectsCount + completedProjectsCount;

    return {
      profile: clientProfile,
      stats: {
        totalProjects,
        activeContracts: activeContractsCount,
        pendingProposals: pendingProposalsCount,
        totalSpent: totalSpending,
      },
      metrics: {
        totalProjects,
        activeProjectsCount,
        draftProjectsCount,
        completedProjectsCount,
        pendingProposalsCount,
        activeContractsCount,
        pendingMilestoneApprovalsCount: pendingMilestonesCount,
        upcomingDeadlinesCount: formattedDeadlines.length,
        totalSpending,
        openDisputesCount,
        notificationsCount: notifications.length,
      },
      charts: {
        spendingOverTime,
        projectStatus: projectStatusChart,
        milestoneCompletion: milestoneCompletionChart,
      },
      widgets: {
        recentProjects,
        recentProposals,
        activeContracts,
        upcomingDeadlines: formattedDeadlines,
        notifications,
      },
    };
  }

  static async getFreelancerDashboard(userId) {
    const freelancerProfile = await prisma.freelancerProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    if (!freelancerProfile) {
      throw ApiError.notFound('Freelancer profile not found');
    }

    const freelancerId = freelancerProfile.id;

    const [
      activeContractsCount,
      completedContractsCount,
      pendingProposalsCount,
      acceptedProposalsCount,
      allProposals,
      completedPayments,
      currentMilestones,
      upcomingDeadlines,
      allTimeEntries,
      unreadMessagesCount,
      recentProposals,
      activeContracts,
      notifications,
    ] = await Promise.all([
      // 1. Active contracts
      prisma.contract.count({
        where: { freelancerProfileId: freelancerId, status: 'ACTIVE' },
      }),
      // 2. Completed contracts
      prisma.contract.count({
        where: { freelancerProfileId: freelancerId, status: 'COMPLETED' },
      }),
      // 3. Pending proposals
      prisma.proposal.count({
        where: { freelancerProfileId: freelancerId, status: 'PENDING' },
      }),
      // 4. Accepted proposals
      prisma.proposal.count({
        where: { freelancerProfileId: freelancerId, status: 'ACCEPTED' },
      }),
      // All proposals for success rate chart
      prisma.proposal.findMany({
        where: { freelancerProfileId: freelancerId },
        select: { status: true },
      }),
      // Completed payments for earnings
      prisma.payment.findMany({
        where: { contract: { freelancerProfileId: freelancerId }, status: 'SUCCESS' },
        select: { amount: true, createdAt: true },
      }),
      // Current milestones
      prisma.milestone.findMany({
        where: {
          contract: { freelancerProfileId: freelancerId, status: 'ACTIVE' },
          status: { in: ['IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'REVISION_REQUESTED'] },
        },
        orderBy: { dueDate: 'asc' },
        take: 6,
        include: { contract: { select: { project: { select: { title: true } } } } },
      }),
      // Upcoming deadlines
      prisma.milestone.findMany({
        where: {
          contract: { freelancerProfileId: freelancerId, status: 'ACTIVE' },
          dueDate: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          status: { in: ['PENDING', 'IN_PROGRESS', 'REVISION_REQUESTED'] },
        },
        orderBy: { dueDate: 'asc' },
        take: 5,
        include: { contract: { select: { id: true, project: { select: { title: true } } } } },
      }),
      // Time entries for working hours
      prisma.timeEntry.findMany({
        where: { userId },
        include: { project: { select: { title: true } } },
      }),
      // Unread messages
      prisma.message.count({
        where: {
          isRead: false,
          senderId: { not: userId },
          conversation: { participants: { some: { userId } } },
        },
      }),
      // Recent proposals
      prisma.proposal.findMany({
        where: { freelancerProfileId: freelancerId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          project: {
            select: {
              id: true,
              title: true,
              budget: true,
              client: { select: { companyName: true, user: { select: { firstName: true, lastName: true } } } },
            },
          },
        },
      }),
      // Active contracts
      prisma.contract.findMany({
        where: { freelancerProfileId: freelancerId, status: 'ACTIVE' },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: {
          project: { select: { id: true, title: true, budget: true } },
          client: { select: { companyName: true, user: { select: { firstName: true, lastName: true } } } },
          milestones: true,
        },
      }),
      // Notifications
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    // Total earnings
    const totalEarnings = completedPayments.reduce((acc, p) => acc + Number(p.amount), 0);

    // Total working hours
    const totalWorkingSeconds = allTimeEntries.reduce((acc, e) => acc + (e.durationSeconds || 0), 0);
    const totalWorkingHours = Number((totalWorkingSeconds / 3600).toFixed(1));

    // 1. Monthly earnings chart
    const months = this.getLastNMonths(6);
    const earningsMap = {};
    months.forEach((m) => {
      earningsMap[m.key] = 0;
    });

    completedPayments.forEach((p) => {
      const d = new Date(p.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (earningsMap[key] !== undefined) {
        earningsMap[key] += Number(p.amount);
      }
    });

    const monthlyEarnings = months.map((m) => ({
      month: m.key,
      label: m.label,
      earnings: Number(earningsMap[m.key].toFixed(2)),
    }));

    // 2. Projects completed chart
    const completedMap = {};
    months.forEach((m) => {
      completedMap[m.key] = 0;
    });

    const projectsCompleted = months.map((m) => ({
      month: m.key,
      label: m.label,
      completed: completedMap[m.key] || 0,
    }));

    // 3. Proposal success rate chart
    const proposalStatusCounts = {};
    allProposals.forEach((p) => {
      proposalStatusCounts[p.status] = (proposalStatusCounts[p.status] || 0) + 1;
    });

    const proposalPalette = {
      ACCEPTED: '#10b981',
      SHORTLISTED: '#38bdf8',
      PENDING: '#fbbf24',
      REJECTED: '#f87171',
      WITHDRAWN: '#94a3b8',
    };

    const proposalSuccessRateChart = Object.entries(proposalStatusCounts).map(([status, count]) => ({
      status,
      count,
      fill: proposalPalette[status] || '#64748b',
    }));

    const totalProposals = allProposals.length;
    const winRate = totalProposals > 0 ? Math.round((acceptedProposalsCount / totalProposals) * 100) : 0;

    // 4. Working hours chart by project
    const projectHoursMap = {};
    allTimeEntries.forEach((e) => {
      const pTitle = e.project?.title || 'General Tasks';
      const hours = (e.durationSeconds || 0) / 3600;
      projectHoursMap[pTitle] = (projectHoursMap[pTitle] || 0) + hours;
    });

    const workingHoursChart = Object.entries(projectHoursMap).map(([project, hours]) => ({
      project: project.length > 20 ? `${project.substring(0, 18)}...` : project,
      fullTitle: project,
      hours: Number(hours.toFixed(1)),
    }));

    // Formatted deadlines
    const now = new Date();
    const formattedDeadlines = upcomingDeadlines.map((m) => {
      const due = m.dueDate ? new Date(m.dueDate) : null;
      const diffMs = due ? due.getTime() - now.getTime() : 0;
      const daysRemaining = due ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : null;
      return {
        id: m.id,
        title: m.title,
        dueDate: m.dueDate,
        daysRemaining,
        isOverdue: daysRemaining !== null && daysRemaining < 0,
        projectTitle: m.contract?.project?.title || 'Contract Deliverable',
        contractId: m.contractId,
      };
    });

    return {
      profile: freelancerProfile,
      stats: {
        totalProposals,
        activeContracts: activeContractsCount,
        completedContracts: completedContractsCount,
        totalEarnings,
      },
      metrics: {
        totalProposals,
        activeProjectsCount: activeContractsCount,
        pendingProposalsCount,
        acceptedProposalsCount,
        earnings: totalEarnings,
        completedProjectsCount: completedContractsCount,
        rating: Number(freelancerProfile.rating || 5.0),
        currentMilestonesCount: currentMilestones.length,
        upcomingDeadlinesCount: formattedDeadlines.length,
        workingHours: totalWorkingHours,
        messagesCount: unreadMessagesCount,
        winRate,
      },
      charts: {
        monthlyEarnings,
        projectsCompleted,
        proposalSuccessRate: proposalSuccessRateChart,
        workingHours: workingHoursChart,
      },
      widgets: {
        currentMilestones,
        upcomingDeadlines: formattedDeadlines,
        recentProposals,
        activeContracts,
        notifications,
      },
    };
  }
}
