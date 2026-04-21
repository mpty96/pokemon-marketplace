import prisma from '../lib/prisma';

interface UpdateProfileInput {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  rut?: string;
  contactPhone?: string;
  socialLinks?: string;
}

export async function getMyProfile(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          username: true,
        },
      },
    },
  });

  return profile;
}

export async function upsertMyProfile(userId: string, data: UpdateProfileInput) {
  const existing = await prisma.profile.findUnique({
    where: { userId },
  });

  if (!existing) {
    return prisma.profile.create({
      data: {
        userId,
        displayName: data.displayName?.trim() || null,
        bio: data.bio?.trim() || null,
        avatarUrl: data.avatarUrl?.trim() || null,
        location: data.location?.trim() || null,
        rut: data.rut?.trim() || null,
        contactPhone: data.contactPhone?.trim() || null,
        socialLinks: data.socialLinks?.trim() || null,
      },
    });
  }

  const immutableFields = [
    { key: 'location', label: 'Locación' },
    { key: 'rut', label: 'RUT' },
    { key: 'contactPhone', label: 'Número de contacto' },
  ] as const;

  for (const field of immutableFields) {
    const oldValue = existing[field.key];
    const newValue = data[field.key]?.trim();

    if (oldValue && newValue && oldValue !== newValue) {
      throw new Error(`IMMUTABLE_FIELD:${field.key}`);
    }
  }

  return prisma.profile.update({
    where: { userId },
    data: {
      displayName: data.displayName?.trim() || null,
      bio: data.bio?.trim() || null,
      avatarUrl: data.avatarUrl?.trim() || null,
      location: existing.location || data.location?.trim() || null,
      rut: existing.rut || data.rut?.trim() || null,
      contactPhone: existing.contactPhone || data.contactPhone?.trim() || null,
      socialLinks: data.socialLinks?.trim() || null,
    },
  });
}

export async function getPublicProfileByUsername(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      username: true,
      profile: true,
        ratingsReceived: {
        orderBy: { createdAt: 'desc' },
        include: {
            rater: {
            select: {
                id: true,
                username: true,
            },
            },
            sale: {
            select: {
                sellerId: true,
                buyerId: true,
            },
            },
        },
        },
      ratingsGiven: {
        orderBy: { createdAt: 'desc' },
        include: {
          rater: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
    },
  });

  if (!user) throw new Error('USER_NOT_FOUND');

  const ratingsAsSeller =
    user.ratingsReceived?.filter((r) => r.ratedId === r.sale.sellerId) || [];

  const ratingsAsBuyer =
    user.ratingsReceived?.filter((r) => r.ratedId === r.sale.buyerId) || [];

  return {
    username: user.username,
    profile: user.profile,
    ratingsReceived: user.ratingsReceived,
    ratingsAsSeller,
    ratingsAsBuyer,
  };
}

export async function getProfileCompletionStatus(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: {
      location: true,
      rut: true,
      contactPhone: true,
    },
  });

  const missingFields = [
    !profile?.location ? 'location' : null,
    !profile?.rut ? 'rut' : null,
    !profile?.contactPhone ? 'contactPhone' : null,
  ].filter(Boolean) as string[];

  return {
    complete: missingFields.length === 0,
    missingFields,
  };
}