import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import prisma from '../lib/prisma';

export interface AuthRequest extends Request {
  user?: any;
  body: any;
  params: any;
  query: any;
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token no proporcionado' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        profile: {
          select: {
            isBanned: true,
          },
        },
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Usuario no encontrado' });
      return;
    }

    if (user.profile?.isBanned) {
      res.status(403).json({ error: 'Cuenta suspendida' });
      return;
    }

    req.user = {
      ...payload,
      role: user.role,
    };

    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}