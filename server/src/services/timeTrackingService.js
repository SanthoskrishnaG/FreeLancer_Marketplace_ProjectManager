import { prisma } from '../config/database.js';
import { ApiError } from '../utils/api-error.js';

export class TimeTrackingService {
  static async startTimer(userId, { projectId, milestoneId, contractId, description = 'Working on task' }) {
    const freelancerProfile = await prisma.freelancerProfile.findUnique({
      where: { userId },
    });

    if (!freelancerProfile) {
      throw ApiError.forbidden('Only freelancers can track working time');
    }

    // Check if there is an active running timer
    const activeTimer = await prisma.timeEntry.findFirst({
      where: {
        userId,
        endTime: null,
      },
    });

    if (activeTimer) {
      throw ApiError.badRequest('You already have an active timer running. Stop it before starting a new one.');
    }

    return prisma.timeEntry.create({
      data: {
        userId,
        freelancerProfileId: freelancerProfile.id,
        projectId,
        milestoneId: milestoneId || null,
        contractId: contractId || null,
        description,
        startTime: new Date(),
      },
    });
  }

  static async stopTimer(userId, timeEntryId) {
    const entry = await prisma.timeEntry.findUnique({
      where: { id: timeEntryId },
    });

    if (!entry || entry.userId !== userId) {
      throw ApiError.notFound('Active timer not found or unauthorized');
    }

    if (entry.endTime) {
      throw ApiError.badRequest('This timer has already been stopped');
    }

    const endTime = new Date();
    const durationSeconds = Math.max(Math.round((endTime.getTime() - new Date(entry.startTime).getTime()) / 1000), 0);

    return prisma.timeEntry.update({
      where: { id: timeEntryId },
      data: {
        endTime,
        durationSeconds,
      },
    });
  }

  static async addManualEntry(userId, data) {
    const freelancerProfile = await prisma.freelancerProfile.findUnique({
      where: { userId },
    });

    if (!freelancerProfile) {
      throw ApiError.forbidden('Only freelancers can log work hours');
    }

    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (endTime <= startTime) {
      throw ApiError.badRequest('End time must be later than start time');
    }

    const durationSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

    return prisma.timeEntry.create({
      data: {
        userId,
        freelancerProfileId: freelancerProfile.id,
        projectId: data.projectId,
        milestoneId: data.milestoneId || null,
        contractId: data.contractId || null,
        description: data.description || 'Manual entry',
        startTime,
        endTime,
        durationSeconds,
        isBillable: data.isBillable !== false,
      },
    });
  }

  static async getEntries(userId) {
    const entries = await prisma.timeEntry.findMany({
      where: { userId },
      orderBy: { startTime: 'desc' },
      include: {
        project: { select: { id: true, title: true } },
        milestone: { select: { id: true, title: true } },
      },
    });

    // Calculate aggregated metrics
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let dailySeconds = 0;
    let weeklySeconds = 0;
    let monthlySeconds = 0;
    let totalSeconds = 0;

    entries.forEach((e) => {
      const sec = e.durationSeconds || 0;
      const d = new Date(e.startTime);
      totalSeconds += sec;
      if (d >= oneDayAgo) dailySeconds += sec;
      if (d >= oneWeekAgo) weeklySeconds += sec;
      if (d >= oneMonthAgo) monthlySeconds += sec;
    });

    return {
      entries,
      summary: {
        dailyHours: Number((dailySeconds / 3600).toFixed(1)),
        weeklyHours: Number((weeklySeconds / 3600).toFixed(1)),
        monthlyHours: Number((monthlySeconds / 3600).toFixed(1)),
        totalHours: Number((totalSeconds / 3600).toFixed(1)),
      },
    };
  }

  static async createManualEntry(userId, data) {
    return this.addManualEntry(userId, data);
  }

  static async getFreelancerTimeSummary(userId) {
    return this.getEntries(userId);
  }

  static async getContractTimeEntries(contractId, userId) {
    return prisma.timeEntry.findMany({
      where: { contractId },
      orderBy: { startTime: 'desc' },
      include: {
        milestone: { select: { id: true, title: true } },
        user: { select: { firstName: true, lastName: true, avatarUrl: true } },
      },
    });
  }
}
