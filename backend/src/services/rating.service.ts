import prisma from '../lib/prisma';

export async function createRating(
  saleId:             string,
  raterId:            string,
  priceScore:         number,
  communicationScore: number,
  processScore:       number,
  comment?:           string
) {
  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
    include: { listing: true },
  });

  if (!sale)                        throw new Error('SALE_NOT_FOUND');
  if (sale.status !== 'COMPLETED')  throw new Error('SALE_NOT_COMPLETED');
  if (sale.buyerId  !== raterId &&
      sale.sellerId !== raterId)    throw new Error('UNAUTHORIZED');

  // El ratedId es el otro participante
  const ratedId = sale.buyerId === raterId ? sale.sellerId : sale.buyerId;

  // Verificar que no haya calificado antes
  const existing = await prisma.rating.findUnique({
    where: { saleId_raterId: { saleId, raterId } },
  });
  if (existing) throw new Error('ALREADY_RATED');

  // Validar scores
  const scores = [priceScore, communicationScore, processScore];
  if (scores.some((s) => s < 1 || s > 5)) {
    throw new Error('INVALID_SCORE');
  }

  const averageScore = Number(
    ((priceScore + communicationScore + processScore) / 3).toFixed(2)
  );

  const rating = await prisma.rating.create({
    data: {
      saleId,
      raterId,
      ratedId,
      priceScore,
      communicationScore,
      processScore,
      averageScore,
      comment,
    },
  });

  // Recalcular reputación del usuario calificado
  await recalculateReputation(ratedId);

  return rating;
}

async function recalculateReputation(userId: string) {
  const ratings = await prisma.rating.findMany({
    where: { ratedId: userId },
    select: { averageScore: true },
  });

  if (ratings.length === 0) return;

  const total     = ratings.reduce((sum, r) => sum + r.averageScore, 0);
  const newScore  = Number((total / ratings.length).toFixed(2));

  await prisma.profile.update({
    where: { userId },
    data:  { reputationScore: newScore },
  });
}

export async function getRatingsBySale(saleId: string, userId: string) {
  const sale = await prisma.sale.findUnique({ where: { id: saleId } });

  if (!sale)                                          throw new Error('SALE_NOT_FOUND');
  if (sale.buyerId !== userId && sale.sellerId !== userId) throw new Error('UNAUTHORIZED');

  const ratings = await prisma.rating.findMany({
    where: { saleId },
    include: {
      rater: { select: { id: true, username: true } },
    },
  });

  const myRating    = ratings.find((r) => r.raterId === userId);
  const theirRating = ratings.find((r) => r.raterId !== userId);
  const canRate     = sale.status === 'COMPLETED' && !myRating;

  return { ratings, myRating, theirRating, canRate };
}

export async function getRatingsByUser(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      profile: true,
      ratingsReceived: {
        orderBy: { createdAt: 'desc' },
        include: {
          rater: { select: { id: true, username: true } },
          sale:  {
            include: {
              listing: { select: { title: true, images: true } },
            },
          },
        },
      },
    },
  });

  if (!user) throw new Error('USER_NOT_FOUND');

  return {
    username:       user.username,
    profile:        user.profile,
    ratingsReceived: user.ratingsReceived,
  };
}