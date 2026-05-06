import prisma from '../lib/prisma';

export async function createUserReport(
  reporterId: string,
  reportedUsername: string,
  reason: string,
  description: string
) {
  if (!reason?.trim()) throw new Error('REASON_REQUIRED');
  if (!description?.trim() || description.trim().length < 10) {
    throw new Error('DESCRIPTION_TOO_SHORT');
  }

  const reportedUser = await prisma.user.findUnique({
    where: { username: reportedUsername },
    select: { id: true, username: true },
  });

  if (!reportedUser) throw new Error('USER_NOT_FOUND');
  if (reportedUser.id === reporterId) throw new Error('CANNOT_REPORT_SELF');

  const existingPending = await prisma.report.findFirst({
    where: {
      reporterId,
      reportedId: reportedUser.id,
      status: 'PENDING',
    },
    select: { id: true },
  });

  if (existingPending) throw new Error('REPORT_ALREADY_PENDING');

  return prisma.report.create({
    data: {
      reporterId,
      reportedId: reportedUser.id,
      reason: reason.trim(),
      description: description.trim(),
    },
  });
}

export async function getAdminReports(status?: string) {
  return prisma.report.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      reporter: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
      reported: {
        select: {
          id: true,
          username: true,
          email: true,
          profile: {
            select: {
              displayName: true,
              avatarUrl: true,
              strikes: true,
              isBanned: true,
            },
          },
        },
      },
    },
  });
}

export async function getAdminReportById(reportId: string) {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      reporter: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
      reported: {
        select: {
          id: true,
          username: true,
          email: true,
          profile: true,
        },
      },
    },
  });

  if (!report) throw new Error('REPORT_NOT_FOUND');

  return report;
}

export async function resolveAdminReport(
  reportId: string,
  data: {
    status: 'REVIEWED' | 'DISMISSED' | 'ACTION_TAKEN';
    adminNote?: string;
    applyStrike?: boolean;
    banUser?: boolean;
  }
) {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      reported: {
        include: { profile: true },
      },
    },
  });

  if (!report) throw new Error('REPORT_NOT_FOUND');

  return prisma.$transaction(async (tx) => {
    let newStrikes = report.reported.profile?.strikes || 0;

    if (data.applyStrike) {
      newStrikes += 1;

      await tx.profile.update({
        where: { userId: report.reportedId },
        data: {
          strikes: newStrikes,
          isBanned: data.banUser || newStrikes >= 3,
        },
      });
    } else if (data.banUser) {
      await tx.profile.update({
        where: { userId: report.reportedId },
        data: { isBanned: true },
      });
    }

    return tx.report.update({
      where: { id: reportId },
      data: {
        status: data.status,
        adminNote: data.adminNote?.trim() || null,
        reviewedAt: new Date(),
      },
    });
  });
}