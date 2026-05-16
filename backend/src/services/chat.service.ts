import prisma from '../lib/prisma';
import { uploadImage } from '../utils/cloudinary';


const MESSAGE_LIMIT_WINDOW_MS = 10_000;
const MESSAGE_LIMIT_COUNT = 5;

const messageRateMap = new Map<string, number[]>();

function assertCanSendMessage(userId: string) {
  const now = Date.now();
  const recent = (messageRateMap.get(userId) || []).filter(
    (timestamp) => now - timestamp < MESSAGE_LIMIT_WINDOW_MS
  );

  if (recent.length >= MESSAGE_LIMIT_COUNT) {
    throw new Error('MESSAGE_RATE_LIMIT');
  }

  recent.push(now);
  messageRateMap.set(userId, recent);
}


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

export async function uploadChatImages(buffers: Buffer[]) {
  return Promise.all(buffers.map((buffer) => uploadImage(buffer, 'chat')));
}


export async function sendChatMessage(
  listingId: string,
  senderId: string,
  content?: string,
  imageUrls: string[] = []
) {
  const cleanContent = content?.trim() || '';
  const cleanImageUrls = imageUrls.filter(Boolean).slice(0, 4);
  assertCanSendMessage(senderId);

  if (!cleanContent && cleanImageUrls.length === 0) {
    throw new Error('EMPTY_MESSAGE');
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, sellerId: true },
  });

  if (!listing) throw new Error('LISTING_NOT_FOUND');

  let conversation = await prisma.conversation.findUnique({
    where: { listingId },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { listingId },
    });
  }

  return prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId,
      content: cleanContent,
      imageUrls: cleanImageUrls,
    },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          profile: { select: { displayName: true, avatarUrl: true } },
        },
      },
    },
  });
}


export async function deleteUserConversations(userId: string, conversationIds: string[]) {
  const cleanIds = [...new Set(conversationIds.filter(Boolean))];

  if (cleanIds.length === 0) {
    throw new Error('NO_CONVERSATIONS_SELECTED');
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      id: { in: cleanIds },
      OR: [
        { listing: { sellerId: userId } },
        { messages: { some: { senderId: userId } } },
      ],
    },
    include: {
      listing: {
        include: {
          sale: true,
        },
      },
    },
  });

  if (conversations.length === 0) {
    throw new Error('CONVERSATIONS_NOT_FOUND');
  }

  const hasActiveSale = conversations.some((conv) => {
    const status = conv.listing.sale?.status;
    return status && status !== 'COMPLETED' && status !== 'CANCELLED';
  });

  if (hasActiveSale) {
    throw new Error('ACTIVE_SALE_CONVERSATION');
  }

  const allowedIds = conversations.map((conv) => conv.id);

  await prisma.$transaction([
    prisma.message.deleteMany({
      where: {
        conversationId: { in: allowedIds },
      },
    }),

    prisma.conversation.deleteMany({
      where: {
        id: { in: allowedIds },
      },
    }),
  ]);

  return {
    deletedCount: allowedIds.length,
  };
}