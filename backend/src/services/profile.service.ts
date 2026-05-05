import prisma from '../lib/prisma';

interface UpdateProfileInput {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  rut?: string;
  contactPhone?: string;
  avatarFile?: Express.Multer.File;
}

function fileToDataUrl(file?: Express.Multer.File): string | null {
  if (!file) return null;
  const base64 = file.buffer.toString('base64');
  return `data:${file.mimetype};base64,${base64}`;
}

function normalizeRut(rut?: string): string | null {
  if (!rut) return null;

  const cleanRut = rut
    .replace(/\./g, '')
    .replace(/-/g, '')
    .trim()
    .toUpperCase();

  if (!/^\d{7,8}[0-9K]$/.test(cleanRut)) {
    throw new Error('INVALID_RUT');
  }

  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1);

  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const expectedValue = 11 - (sum % 11);
  const expectedDv =
    expectedValue === 11 ? '0' :
    expectedValue === 10 ? 'K' :
    String(expectedValue);

  if (dv !== expectedDv) {
    throw new Error('INVALID_RUT');
  }

  return `${body}-${dv}`;
}

function normalizeChileanPhone(phone?: string): string | null {
  if (!phone) return null;

  const digits = phone.replace(/\D/g, '');

  if (digits.length === 9 && digits.startsWith('9')) {
    return `+56${digits}`;
  }

  if (digits.length === 11 && digits.startsWith('569')) {
    return `+${digits}`;
  }

  throw new Error('INVALID_PHONE');
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
  const existingProfile = await prisma.profile.findUnique({
    where: { userId },
  });

  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
    },
  });

  if (!existingUser) throw new Error('USER_NOT_FOUND');

  const normalizedRut = data.rut ? normalizeRut(data.rut) : null;
  const normalizedPhone = data.contactPhone ? normalizeChileanPhone(data.contactPhone) : null;

  const immutableFields = [
    { key: 'location', label: 'Locación' },
    { key: 'rut', label: 'RUT' },
    { key: 'contactPhone', label: 'Número de contacto' },
  ] as const;

  if (existingProfile) {
    for (const field of immutableFields) {
      const oldValue = existingProfile[field.key];
      const newValue =
        field.key === 'rut'
          ? normalizedRut
          : field.key === 'contactPhone'
            ? normalizedPhone
            : data[field.key]?.trim();

      if (oldValue && newValue && oldValue !== newValue) {
        throw new Error(`IMMUTABLE_FIELD:${field.key}`);
      }
    }
  }

  if (normalizedRut) {
    const rutInUse = await prisma.profile.findFirst({
      where: {
        rut: normalizedRut,
        userId: { not: userId },
      },
      select: { id: true },
    });

    if (rutInUse) throw new Error('RUT_IN_USE');
  }

  if (normalizedPhone) {
    const phoneInUse = await prisma.profile.findFirst({
      where: {
        contactPhone: normalizedPhone,
        userId: { not: userId },
      },
      select: { id: true },
    });

    if (phoneInUse) throw new Error('PHONE_IN_USE');
  }

  const avatarFromFile = fileToDataUrl(data.avatarFile);
  const finalAvatarUrl =
    avatarFromFile ||
    data.avatarUrl?.trim() ||
    existingProfile?.avatarUrl ||
    null;

  const profileData = {
    displayName: data.displayName?.trim() || null,
    bio: data.bio?.trim() || null,
    avatarUrl: finalAvatarUrl,
    location: existingProfile?.location || data.location?.trim() || null,
    rut: existingProfile?.rut || normalizedRut,
    contactPhone: existingProfile?.contactPhone || normalizedPhone,
  };

  const result = existingProfile
    ? await prisma.profile.update({
        where: { userId },
        data: profileData,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
        },
      })
    : await prisma.profile.create({
        data: {
          userId,
          ...profileData,
        },
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