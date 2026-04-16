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
  include: {
    rater: { select: { id: true, username: true } },
  },
});

  // Recalcular reputación del usuario calificado
  await recalculateReputation(ratedId);

  return rating;
}

async function recalculateReputation(userId: string) {
  const allRatings = await prisma.rating.findMany({
    where: { ratedId: userId },
    include: {
      sale: { select: { sellerId: true } },
    },
  });

  if (allRatings.length === 0) return;

  // Separar por rol
  const asSeller = allRatings.filter((r) => r.sale.sellerId === userId);
  const asBuyer  = allRatings.filter((r) => r.sale.sellerId !== userId);

  const avg = (arr: typeof allRatings) =>
    arr.length === 0 ? 0 :
    Number((arr.reduce((s, r) => s + r.averageScore, 0) / arr.length).toFixed(2));

  const reputationAsSeller = avg(asSeller);
  const reputationAsBuyer  = avg(asBuyer);
  const reputationScore    = avg(allRatings);

  await prisma.profile.update({
    where: { userId },
    data:  { reputationScore, reputationAsSeller, reputationAsBuyer },
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

  // Separar calificaciones por rol
  const asSeller = user.ratingsReceived.filter((r) => r.sale.sellerId === user.id);
  const asBuyer  = user.ratingsReceived.filter((r) => r.sale.sellerId !== user.id);

  return {
    username:           user.username,
    profile:            user.profile,
    ratingsReceived:    user.ratingsReceived,
    ratingsAsSeller:    asSeller,
    ratingsAsBuyer:     asBuyer,
  };
}