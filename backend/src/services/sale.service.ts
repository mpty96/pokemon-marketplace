import prisma from '../lib/prisma';

export async function initiateSale(listingId: string, buyerId: string) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
  });

  if (!listing)                          throw new Error('LISTING_NOT_FOUND');
  if (listing.status !== 'ACTIVE')       throw new Error('LISTING_NOT_AVAILABLE');
  if (listing.sellerId === buyerId)      throw new Error('CANNOT_BUY_OWN');

  // Verificar que no existe ya una venta activa
  const existingSale = await prisma.sale.findUnique({
    where: { listingId },
  });
  if (existingSale) throw new Error('SALE_ALREADY_EXISTS');

  // Crear venta y pausar publicación en una transacción
  const [sale] = await prisma.$transaction([
    prisma.sale.create({
      data: {
        listingId,
        buyerId,
        sellerId:      listing.sellerId,
        finalPriceCLP: listing.priceCLP,
        status:        'PENDING',
      },
      include: {
        listing: true,
        buyer:   { select: { id: true, username: true } },
        seller:  { select: { id: true, username: true } },
      },
    }),
    prisma.listing.update({
      where: { id: listingId },
      data:  { status: 'PAUSED' },
    }),
  ]);

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