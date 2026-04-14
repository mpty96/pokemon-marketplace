import prisma from '../lib/prisma';

export async function getConversation(listingId: string, userId: string) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { sellerId: true, status: true },
  });

  if (!listing) throw new Error('LISTING_NOT_FOUND');

  const conversation = await prisma.conversation.findUnique({
    where: { listingId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              profile: { select: { displayName: true, avatarUrl: true } },
            },
          },
        },
      },
    },
  });

  return {
    conversation,
    listingStatus: listing.status,
    isSeller: listing.sellerId === userId,
  };
}

export async function getUserConversations(userId: string) {
  // Buscar conversaciones donde el usuario es vendedor o comprador
  const conversations = await prisma.conversation.findMany({
    where: {
      listing: {
        OR: [
          { sellerId: userId },
          {
            conversation: {
              messages: {
                some: { senderId: userId },
              },
            },
          },
        ],
      },
    },
    include: {
      listing: {
        include: {
          seller: {
            select: {
              id: true,
              username: true,
              profile: { select: { displayName: true, avatarUrl: true } },
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1, // Solo el último mensaje
        include: {
          sender: {
            select: { id: true, username: true },
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  // Filtrar solo las que el usuario realmente participó
  const filtered = conversations.filter((conv) => {
    const isSeller = conv.listing.sellerId === userId;
    const isBuyer  = conv.messages.some((m) => false) ||
      conv.listing.sellerId !== userId; // simplificado abajo
    return true; // filtramos en la query de abajo
  });

  // Query más precisa: conversaciones donde el usuario envió mensajes O es vendedor
  const precise = await prisma.conversation.findMany({
    where: {
      OR: [
        { listing: { sellerId: userId } },
        { messages: { some: { senderId: userId } } },
      ],
    },
    include: {
      listing: {
        include: {
          seller: {
            select: {
              id: true,
              username: true,
              profile: { select: { displayName: true, avatarUrl: true } },
            },
          },
          sale: true,
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          sender: { select: { id: true, username: true } },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return precise.map((conv) => ({
    id:            conv.id,
    listingId:     conv.listing.id,
    listingTitle:  conv.listing.title,
    listingImage:  conv.listing.images[0] || null,
    listingStatus: conv.listing.status,
    listingPrice:  conv.listing.priceCLP,
    isSeller:      conv.listing.sellerId === userId,
    seller:        conv.listing.seller,
    sale:          conv.listing.sale,
    lastMessage:   conv.messages[0] || null,
    updatedAt:     conv.updatedAt,
  }));
}