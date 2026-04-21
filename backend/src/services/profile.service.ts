import prisma from '../lib/prisma';

interface UpdateProfileInput {
  username?: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  rut?: string;
  contactPhone?: string;
  socialLinks?: string;
  avatarFile?: Express.Multer.File;
}

function fileToDataUrl(file?: Express.Multer.File): string | null {
  if (!file) return null;
  const base64 = file.buffer.toString('base64');
  return `data:${file.mimetype};base64,${base64}`;
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
          usernameChangedAt: true,
        },
      },
    },
  });

  return profile;
}

export async function upsertMyProfile(userId: string, data: UpdateProfileInput) {
  const existingProfile = await prisma.profile.findUnique({
    where: { userId },
  });

  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      usernameChangedAt: true,
    },
  });

  if (!existingUser) throw new Error('USER_NOT_FOUND');

  const immutableFields = [
    { key: 'location', label: 'Locación' },
    { key: 'rut', label: 'RUT' },
    { key: 'contactPhone', label: 'Número de contacto' },
  ] as const;

  if (existingProfile) {
    for (const field of immutableFields) {
      const oldValue = existingProfile[field.key];
      const newValue = data[field.key]?.trim();

      if (oldValue && newValue && oldValue !== newValue) {
        throw new Error(`IMMUTABLE_FIELD:${field.key}`);
      }
    }
  }

  const nextUsername = data.username?.trim();
  const currentUsername = existingUser.username;

  if (nextUsername && nextUsername !== currentUsername) {
    const usernameInUse = await prisma.user.findFirst({
      where: {
        username: nextUsername,
        id: { not: userId },
      },
      select: { id: true },
    });

    if (usernameInUse) {
      throw new Error('USERNAME_IN_USE');
    }

    if (existingUser.usernameChangedAt) {
      const now = new Date();
      const nextAllowed = new Date(existingUser.usernameChangedAt);
      nextAllowed.setDate(nextAllowed.getDate() + 30);

      if (now < nextAllowed) {
        const diffMs = nextAllowed.getTime() - now.getTime();
        const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        throw new Error(`USERNAME_CHANGE_BLOCKED:${daysLeft}`);
      }
    }
  }

  const avatarFromFile = fileToDataUrl(data.avatarFile);
  const finalAvatarUrl = avatarFromFile || data.avatarUrl?.trim() || existingProfile?.avatarUrl || null;

  const result = await prisma.$transaction(async (tx) => {
    if (nextUsername && nextUsername !== currentUsername) {
      await tx.user.update({
        where: { id: userId },
        data: {
          username: nextUsername,
          usernameChangedAt: new Date(),
        },
      });
    }

    if (!existingProfile) {
      return tx.profile.create({
        data: {
          userId,
          displayName: data.displayName?.trim() || null,
          bio: data.bio?.trim() || null,
          avatarUrl: finalAvatarUrl,
          location: data.location?.trim() || null,
          rut: data.rut?.trim() || null,
          contactPhone: data.contactPhone?.trim() || null,
          socialLinks: data.socialLinks?.trim() || null,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              usernameChangedAt: true,
            },
          },
        },
      });
    }

    return tx.profile.update({
      where: { userId },
      data: {
        displayName: data.displayName?.trim() || null,
        bio: data.bio?.trim() || null,
        avatarUrl: finalAvatarUrl,
        location: existingProfile.location || data.location?.trim() || null,
        rut: existingProfile.rut || data.rut?.trim() || null,
        contactPhone: existingProfile.contactPhone || data.contactPhone?.trim() || null,
        socialLinks: data.socialLinks?.trim() || null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            usernameChangedAt: true,
          },
        },
      },
    });
  });

  return result;
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