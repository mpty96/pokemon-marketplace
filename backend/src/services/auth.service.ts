import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../lib/prisma';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { sendVerificationEmail } from '../utils/email';

export async function registerUser(
  email: string,
  username: string,
  password: string
) {
  // Verificar si ya existe
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existing) {
    if (existing.email === email) throw new Error('EMAIL_IN_USE');
    if (existing.username === username) throw new Error('USERNAME_IN_USE');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const verificationToken = crypto.randomBytes(32).toString('hex');

  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
      verificationToken,
      profile: {
        create: {
          displayName: username,
        },
      },
    },
    include: { profile: true },
  });

  try {
    await sendVerificationEmail(email, verificationToken);
  } catch (error) {
    console.error("EMAIL ERROR:", error);
    throw error;
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    emailVerified: user.emailVerified,
  };
}

export async function verifyEmail(token: string) {
  const user = await prisma.user.findFirst({
    where: { verificationToken: token },
  });

  if (!user) throw new Error('TOKEN_INVALID');
  if (user.emailVerified) throw new Error('ALREADY_VERIFIED');

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationToken: null,
    },
  });

  return { message: 'Email verificado correctamente' };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true },
    
  });

  console.log("LOGIN EMAIL:", email);
  console.log("USER FOUND:", user);
  console.log("JWT_SECRET:", process.env.JWT_SECRET);

  if (!user) throw new Error('INVALID_CREDENTIALS');

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) throw new Error('INVALID_CREDENTIALS');

  if (!user.emailVerified) throw new Error('EMAIL_NOT_VERIFIED');

  const payload = { userId: user.id, email: user.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.profile?.displayName,
      avatarUrl: user.profile?.avatarUrl,
      reputationScore: user.profile?.reputationScore,
    },
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user) throw new Error('USER_NOT_FOUND');

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    emailVerified: user.emailVerified,
    profile: user.profile,
  };
}