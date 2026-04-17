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

  if (conversation) {
    await prisma.message.updateMany({
      where: {
        conversationId: conversation.id,
        senderId: { not: userId },
        read: false,
      },
      data: { read: true },
    });
  }

  const refreshedConversation = conversation
    ? await prisma.conversation.findUnique({
        where: { id: conversation.id },
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
      })
    : null;

  return {
    conversation: refreshedConversation,
    listingStatus: listing.status,
    isSeller: listing.sellerId === userId,
  };
}

export async function getUserConversations(userId: string) {
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

  const conversationIds = precise.map((conv) => conv.id);

  const unreadGrouped = conversationIds.length
    ? await prisma.message.groupBy({
        by: ['conversationId'],
        where: {
          conversationId: { in: conversationIds },
          senderId: { not: userId },
          read: false,
        },
        _count: {
          _all: true,
        },
      })
    : [];

  const unreadMap = new Map(
    unreadGrouped.map((item) => [item.conversationId, item._count._all])
  );

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
    unreadCount:   unreadMap.get(conv.id) || 0,
    updatedAt:     conv.updatedAt,
  }));
}

export async function getUnreadCount(userId: string): Promise<number> {
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { listing: { sellerId: userId } },
        { messages: { some: { senderId: userId } } },
      ],
    },
    select: { id: true },
  });

  const conversationIds = conversations.map((c) => c.id);
  if (conversationIds.length === 0) return 0;

  const count = await prisma.message.count({
    where: {
      conversationId: { in: conversationIds },
      senderId:       { not: userId },
      read:           false,
    },
  });

  return count;
}