
import prisma from '../lib/prisma';

export async function getAdminUsers() {
  return prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      emailVerified: true,
      createdAt: true,

      profile: {
        select: {
          isBetaTester: true,
          isBanned: true,
          strikes: true,
          reputationScore: true,
        },
      },
    },
  });
}