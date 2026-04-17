import prisma from '../lib/prisma';
import { uploadImage, deleteImage } from '../utils/cloudinary';
import { Prisma } from '@prisma/client';

// Definir tipos localmente para evitar el problema de imports de enums
type ListingStatus = 'ACTIVE' | 'PAUSED' | 'SOLD' | 'CANCELLED';
type CardCondition = 'MINT' | 'NEAR_MINT' | 'EXCELLENT' | 'GOOD' | 'PLAYED' | 'POOR';
type CardRarity    = 'COMMON' | 'UNCOMMON' | 'RARE' | 'HOLO_RARE' | 'ULTRA_RARE' | 'SECRET_RARE' | 'PROMO';

interface CreateListingInput {
  sellerId:     string;
  title:        string;
  cardName:     string;
  edition:      string;
  setNumber?:   string;
  condition:    CardCondition;
  rarity:       CardRarity;
  priceCLP:     number;
  description?: string;
  imageFiles:   Buffer[];
}

interface ListingFilters {
  search?:    string;
  edition?:   string;
  condition?: CardCondition;
  rarity?:    CardRarity;
  minPrice?:  number;
  maxPrice?:  number;
  page?:      number;
  limit?:     number;
}

export async function createListing(input: CreateListingInput) {
  const { imageFiles, sellerId, ...data } = input;

  const imageUrls = await Promise.all(
    imageFiles.map((buffer) => uploadImage(buffer, 'listings'))
  );

  const listing = await prisma.listing.create({
    data: {
      ...data,
      sellerId,
      images: imageUrls,
    },
    include: {
      seller: {
        select: {
          id: true,
          username: true,
          profile: { select: { displayName: true, avatarUrl: true, reputationScore: true } },
        },
      },
    },
  });

  return listing;
}

export async function getListings(filters: ListingFilters) {
  const {
    search, edition, condition, rarity,
    minPrice, maxPrice, page = 1, limit = 12,
  } = filters;

  const skip = (page - 1) * limit;

  const where: Prisma.ListingWhereInput = {
    status:    'ACTIVE' as ListingStatus,
    deletedAt: null, // 👈 excluir soft-deleted
  };

  if (search) {
    where.OR = [
      { cardName: { contains: search, mode: 'insensitive' } },
      { title:    { contains: search, mode: 'insensitive' } },
      { edition:  { contains: search, mode: 'insensitive' } },
    ];
  }

  if (edition)   where.edition   = { contains: edition, mode: 'insensitive' };
  if (condition) where.condition = condition;
  if (rarity)    where.rarity    = rarity;
  if (minPrice || maxPrice) {
    where.priceCLP = {};
    if (minPrice) where.priceCLP = { ...where.priceCLP as object, gte: minPrice };
    if (maxPrice) where.priceCLP = { ...where.priceCLP as object, lte: maxPrice };
  }

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            profile: { select: { displayName: true, avatarUrl: true, reputationScore: true } },
          },
        },
      },
    }),
    prisma.listing.count({ where }),
  ]);

  return {
    listings,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getListingById(id: string) {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      seller: {
        select: {
          id: true,
          username: true,
          profile: { select: { displayName: true, avatarUrl: true, reputationScore: true } },
        },
      },
    },
  });

  if (!listing) throw new Error('LISTING_NOT_FOUND');

  await prisma.listing.update({
    where: { id },
    data: { views: { increment: 1 } },
  });

  return listing;
}

export async function updateListing(
  id: string,
  sellerId: string,
  data: Partial<{
    title: string;
    cardName: string;
    edition: string;
    setNumber: string;
    condition: CardCondition;
    rarity: CardRarity;
    priceCLP: number;
    description: string;
  }>
) {
  const listing = await prisma.listing.findUnique({ where: { id } });

  if (!listing)                      throw new Error('LISTING_NOT_FOUND');
  if (listing.sellerId !== sellerId) throw new Error('UNAUTHORIZED');
  if (listing.status !== 'ACTIVE')   throw new Error('LISTING_NOT_EDITABLE');

  return prisma.listing.update({ where: { id }, data });
}

export async function deleteListing(id: string, sellerId: string) {
  const listing = await prisma.listing.findUnique({ where: { id } });

  if (!listing)                      throw new Error('LISTING_NOT_FOUND');
  if (listing.sellerId !== sellerId) throw new Error('UNAUTHORIZED');
  if (listing.status === 'PAUSED')   throw new Error('LISTING_IN_SALE');
  if (listing.deletedAt)             throw new Error('ALREADY_DELETED');

  // Soft delete — no borrar físicamente
  await prisma.listing.update({
    where: { id },
    data:  { deletedAt: new Date(), status: 'CANCELLED' },
  });

  return { message: 'Publicación eliminada' };
}

export async function getMyListings(sellerId: string) {
  return prisma.listing.findMany({
    where: {
      sellerId,
      deletedAt: null,
      status: { in: ['ACTIVE', 'PAUSED'] }, // 👈 excluye SOLD y CANCELLED
    },
    orderBy: { createdAt: 'desc' },
    include: {
      seller: {
        select: {
          id: true,
          username: true,
          profile: { select: { displayName: true, avatarUrl: true, reputationScore: true } },
        },
      },
    },
  });
}

export async function getListingsHistory(userId: string) {
  // Ventas del usuario (como vendedor)
const sold = await prisma.listing.findMany({ where: 
  { sellerId: userId }, 
  orderBy: { createdAt: 'desc' }, 
  include: { seller: { select: { id: true, username: true, profile: { 
    select: { displayName: true, avatarUrl: true, reputationScore: true } 
  }, }, }, 
  sale: { select: { id: true, status: true, finalPriceCLP: true, completedAt: true, buyer: {
     select: { id: true, username: true } }, }, }, }, });

  // Compras del usuario (como comprador)
  const purchases = await prisma.sale.findMany({
    where: {
      buyerId:  userId,
      status:   'COMPLETED',
    },
    orderBy: { completedAt: 'desc' },
    include: {
      listing: {
        include: {
          seller: {
            select: {
              id: true, username: true,
              profile: { select: { displayName: true, avatarUrl: true, reputationScore: true } },
            },
          },
        },
      },
    },
  });

  return { 
    asseller: sold, 
    asbuyer: purchases.map((s) => 
      ({ ...s.listing, role: 'buyer', sale: 
        { id: s.id, status: s.status, finalPriceCLP: s.finalPriceCLP, completedAt: s.completedAt, seller: 
          { id: s.listing.seller.id, username: s.listing.seller.username, }, }, })), }; }
