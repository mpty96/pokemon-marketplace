import prisma from '../lib/prisma';

export async function initiateSale(listingId: string, sellerId: string, quantity = 1) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
  });

  if (!listing) throw new Error('LISTING_NOT_FOUND');
  if (listing.status !== 'ACTIVE') throw new Error('LISTING_NOT_AVAILABLE');
  if (listing.sellerId !== sellerId) throw new Error('ONLY_SELLER_CAN_INITIATE');

  const safeQuantity =
  listing.listingType === 'POKEMON_PRODUCT'
    ? Math.max(1, Math.min(3, Number(quantity || 1)))
    : 1;

  if (listing.listingType === 'POKEMON_PRODUCT') {
    if (!listing.stock || listing.stock < safeQuantity) {
      throw new Error('INSUFFICIENT_STOCK');
    }
  }

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
    existingSale.buyerId === buyerId &&
    ['PENDING', 'BUYER_CONFIRMED', 'SELLER_CONFIRMED'].includes(existingSale.status)
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
            finalPriceCLP: listing.priceCLP * safeQuantity,
            quantity: safeQuantity,
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
            finalPriceCLP: listing.priceCLP * safeQuantity,
            quantity: safeQuantity,
            status: 'PENDING',
          },
          include: {
            listing: true,
            buyer: { select: { id: true, username: true } },
            seller: { select: { id: true, username: true } },
          },
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
  const quantitySold = sale.quantity || 1;

  if (sale.listing.listingType === 'POKEMON_PRODUCT') {
    const currentStock = sale.listing.stock || 0;
    const nextStock = Math.max(0, currentStock - quantitySold);

    await prisma.$transaction([
      prisma.sale.update({
        where: { id: sale.id },
        data: updateData,
      }),

      prisma.listing.update({
        where: { id: listingId },
        data: {
          stock: nextStock,
          status: nextStock > 0 ? 'ACTIVE' : 'SOLD',
        },
      }),

      prisma.profile.update({
        where: { userId: sale.sellerId },
        data: { totalSales: { increment: 1 } },
      }),

      prisma.profile.update({
        where: { userId: sale.buyerId },
        data: { totalPurchases: { increment: 1 } },
      }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.sale.update({
        where: { id: sale.id },
        data: updateData,
      }),

      prisma.listing.update({
        where: { id: listingId },
        data: { status: 'SOLD' },
      }),

      prisma.profile.update({
        where: { userId: sale.sellerId },
        data: { totalSales: { increment: 1 } },
      }),

      prisma.profile.update({
        where: { userId: sale.buyerId },
        data: { totalPurchases: { increment: 1 } },
      }),
    ]);
  }

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

function normalizeText(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar tildes
    .toLowerCase()

    // reemplazar guiones y underscores por espacio
    .replace(/[-_]/g, ' ')

    // quitar símbolos raros
    .replace(/[^\w\s]/g, '')

    // quitar espacios dobles
    .replace(/\s+/g, ' ')

    // singularizar plurales comunes
    .replace(/\bcollections\b/g, 'collection')
    .replace(/\bboosters\b/g, 'booster')
    .replace(/\bboxes\b/g, 'box')
    .replace(/\bpacks\b/g, 'pack')
    .replace(/\btrainers\b/g, 'trainer')

    .trim();
}

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
    edition: true,
    setNumber: true,
    language: true,
    condition: true,
    listingType: true,
    },
  });

  if (!baseListing) throw new Error('LISTING_NOT_FOUND');

  const fromDate = getRangeDate(range);

  const normalizedCardName = normalizeText(baseListing.cardName);
  const normalizedEdition = normalizeText(baseListing.edition);

  const listingMatch: any = {
    listingType: baseListing.listingType,
  };

  if (baseListing.listingType === 'CARD') {
    listingMatch.language = baseListing.language;
    listingMatch.condition = baseListing.condition;

    if (baseListing.setNumber) {
      listingMatch.setNumber = {
        equals: baseListing.setNumber,
        mode: 'insensitive',
      };
    }
  }

  if (baseListing.listingType === 'POKEMON_PRODUCT') {
    listingMatch.condition = baseListing.condition;
  }

  const rawSales = await prisma.sale.findMany({
    where: {
      status: 'COMPLETED',
      completedAt: { gte: fromDate },
      listing: listingMatch,
    },
    orderBy: { completedAt: 'asc' },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          cardName: true,
          edition: true,
          images: true,
        },
      },
    },
  });

  const sales = rawSales.filter((sale) => {
    const saleCardName = normalizeText(sale.listing.cardName);
    const saleEdition = normalizeText(sale.listing.edition);

  return (
    saleCardName === normalizedCardName &&
    saleEdition === normalizedEdition
  );
});

return sales.map((sale) => ({
    id: sale.id,
    listingId: sale.listingId,
    title: sale.listing.title,
    cardName: sale.listing.cardName,
    image: sale.listing.images[0] || null,
    priceCLP: Math.round(sale.finalPriceCLP / (sale.quantity || 1)),
    completedAt: sale.completedAt,
  }));
}