import prisma from '../lib/prisma';
import { uploadImage } from '../utils/cloudinary';

export async function getMyWantedCards(userId: string) {
  return prisma.wantedCard.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getPublicWantedCards(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  return prisma.wantedCard.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function createWantedCard(
  userId: string,
  data: {
    name: string;
    edition?: string;
    setNumber?: string;
    imageFile?: Express.Multer.File;
  }
) {
  let imageUrl: string | undefined;

  if (data.imageFile) {
    imageUrl = await uploadImage(
      data.imageFile.buffer,
      'pokemon-marketplace/wanted-cards'
    );
  }

  return prisma.wantedCard.create({
    data: {
      userId,
      name: data.name.trim(),
      edition: data.edition?.trim() || null,
      setNumber: data.setNumber?.trim() || null,
      imageUrl,
    },
  });
}

export async function deleteWantedCard(
  userId: string,
  wantedCardId: string
) {
  const wantedCard = await prisma.wantedCard.findUnique({
    where: {
      id: wantedCardId,
    },
  });

  if (!wantedCard) {
    throw new Error('WANTED_CARD_NOT_FOUND');
  }

  if (wantedCard.userId !== userId) {
    throw new Error('FORBIDDEN');
  }

  await prisma.wantedCard.delete({
    where: {
      id: wantedCardId,
    },
  });

  return {
    success: true,
  };
}