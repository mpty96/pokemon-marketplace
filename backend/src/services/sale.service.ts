import prisma from '../lib/prisma';

export async function initiateSale(listingId: string, sellerId: string) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
  });

  if (!listing) throw new Error('LISTING_NOT_FOUND');
  if (listing.status !== 'ACTIVE') throw new Error('LISTING_NOT_AVAILABLE');
  if (listing.sellerId !== sellerId) throw new Error('ONLY_SELLER_CAN_INITIATE');

  const conversation = await prisma.conversation.findUnique({
    where: { listingId },
    include: {
      messages: {
        where: {
          senderId: { not: sellerId },
        },
        orderBy: { createdAt: 'asc' },
        take: 1,
        select: { senderId: true },
      },
    },
  });

  const buyerId = conversation?.messages[0]?.senderId;

  if (!buyerId) throw new Error('BUYER_NOT_FOUND');

  const existingSale = await prisma.sale.findUnique({
    where: { listingId },
  });

  if (
    existingSale &&
    ['PENDING', 'BUYER_CONFIRMED', 'SELLER_CONFIRMED', 'COMPLETED'].includes(existingSale.status)
  ) {
    throw new Error('SALE_ALREADY_EXISTS');
  }

  const sale = await prisma.$transaction(async (tx) => {
    const nextSale = existingSale
      ? await tx.sale.update({
          where: { id: existingSale.id },
          data: {
            buyerId,
            sellerId: listing.sellerId,
            finalPriceCLP: listing.priceCLP,
            status: 'PENDING',
            buyerConfirmed: false,
            sellerConfirmed: false,
            buyerConfirmedAt: null,
            sellerConfirmedAt: null,
            completedAt: null,
          },
          include: {
            listing: true,
            buyer: { select: { id: true, username: true } },
            seller: { select: { id: true, username: true } },
          },
        })
      : await tx.sale.create({
          data: {
            listingId,
            buyerId,
            sellerId: listing.sellerId,
            finalPriceCLP: listing.priceCLP,
            status: 'PENDING',
          },
          include: {
            listing: true,
            buyer: { select: { id: true, username: true } },
            seller: { select: { id: true, username: true } },
          },
        });

    await tx.listing.update({
      where: { id: listingId },
      data: { status: 'PAUSED' },
    });

    return nextSale;
  });

  return sale;
}

export async function confirmSale(listingId: string, userId: string, role: 'buyer' | 'seller') {
  const sale = await prisma.sale.findUnique({
    where: { listingId },
    include: {
      listing: true,
      buyer:   { select: { id: true, username: true } },
      seller:  { select: { id: true, username: true } },
    },
  });

  if (!sale)                       throw new Error('SALE_NOT_FOUND');
  if (sale.status === 'COMPLETED') throw new Error('ALREADY_COMPLETED');
  if (sale.status === 'CANCELLED') throw new Error('SALE_CANCELLED');

  // Verificar que el usuario corresponde al rol
  if (role === 'buyer'  && sale.buyerId  !== userId) throw new Error('UNAUTHORIZED');
  if (role === 'seller' && sale.sellerId !== userId) throw new Error('UNAUTHORIZED');

  const updateData: any = {};

  if (role === 'buyer') {
    if (sale.buyerConfirmed) throw new Error('ALREADY_CONFIRMED');
    updateData.buyerConfirmed   = true;
    updateData.buyerConfirmedAt = new Date();
  } else {
    if (sale.sellerConfirmed) throw new Error('ALREADY_CONFIRMED');
    updateData.sellerConfirmed   = true;
    updateData.sellerConfirmedAt = new Date();
  }

  // Verificar si ambos confirmaron
  const buyerConfirmed  = role === 'buyer'  ? true : sale.buyerConfirmed;
  const sellerConfirmed = role === 'seller' ? true : sale.sellerConfirmed;

  if (buyerConfirmed && sellerConfirmed) {
    updateData.status      = 'COMPLETED';
    updateData.completedAt = new Date();

    // Completar venta: marcar listing como SOLD, actualizar perfiles
    await prisma.$transaction([
      prisma.sale.update({
        where: { id: sale.id },
        data:  updateData,
      }),
      prisma.listing.update({
        where: { id: listingId },
        data:  { status: 'SOLD' },
      }),
      prisma.profile.update({
        where: { userId: sale.sellerId },
        data:  { totalSales: { increment: 1 } },
      }),
      prisma.profile.update({
        where: { userId: sale.buyerId },
        data:  { totalPurchases: { increment: 1 } },
      }),
    ]);

    return { ...sale, ...updateData, bothConfirmed: true };
  }

  // Solo uno confirmó por ahora
  const updated = await prisma.sale.update({
    where: { id: sale.id },
    data:  updateData,
    include: {
      buyer:  { select: { id: true, username: true } },
      seller: { select: { id: true, username: true } },
    },
  });

  return { ...updated, bothConfirmed: false };
}

export async function cancelSale(listingId: string, userId: string) {
  const sale = await prisma.sale.findUnique({
    where: { listingId },
  });

  if (!sale)                       throw new Error('SALE_NOT_FOUND');
  if (sale.status === 'COMPLETED') throw new Error('ALREADY_COMPLETED');
  if (sale.buyerId !== userId && sale.sellerId !== userId) throw new Error('UNAUTHORIZED');

  await prisma.$transaction([
    prisma.sale.update({
      where: { id: sale.id },
      data:  { status: 'CANCELLED' },
    }),
    prisma.listing.update({
      where: { id: listingId },
      data:  { status: 'ACTIVE' },
    }),
  ]);

  return { message: 'Venta cancelada' };
}

export async function getSaleByListing(listingId: string, userId: string) {
  const sale = await prisma.sale.findUnique({
    where: { listingId },
    include: {
      buyer:  { select: { id: true, username: true } },
      seller: { select: { id: true, username: true } },
    },
  });

  if (!sale) throw new Error('SALE_NOT_FOUND');

  // Solo comprador o vendedor pueden ver la venta
  if (sale.buyerId !== userId && sale.sellerId !== userId) {
    throw new Error('UNAUTHORIZED');
  }

  return sale;
}


type SalesHistoryRange = '7d' | '1m' | '6m' | '1y';

function getRangeDate(range: SalesHistoryRange): Date {
  const date = new Date();

  if (range === '7d') date.setDate(date.getDate() - 7);
  if (range === '1m') date.setMonth(date.getMonth() - 1);
  if (range === '6m') date.setMonth(date.getMonth() - 6);
  if (range === '1y') date.setFullYear(date.getFullYear() - 1);

  return date;
}

export async function getListingSalesHistory(
  listingId: string,
  range: SalesHistoryRange = '1m'
) {
  const baseListing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      cardName: true,
      listingType: true,
    },
  });

  if (!baseListing) throw new Error('LISTING_NOT_FOUND');

  const fromDate = getRangeDate(range);

  const sales = await prisma.sale.findMany({
    where: {
      status: 'COMPLETED',
      completedAt: { gte: fromDate },
      listing: {
        listingType: baseListing.listingType,
        cardName: {
          equals: baseListing.cardName,
          mode: 'insensitive',
        },
      },
    },
    orderBy: { completedAt: 'asc' },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          cardName: true,
          images: true,
        },
      },
    },
  });

  return sales.map((sale) => ({
    id: sale.id,
    listingId: sale.listingId,
    title: sale.listing.title,
    cardName: sale.listing.cardName,
    image: sale.listing.images[0] || null,
    priceCLP: sale.finalPriceCLP,
    completedAt: sale.completedAt,
  }));
}