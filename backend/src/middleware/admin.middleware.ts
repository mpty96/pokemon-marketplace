import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import prisma from '../lib/prisma';

export async function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { role: true },
    });

    if (!user || user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Acceso denegado' });
      return;
    }

    next();
  } catch {
    res.status(500).json({ error: 'Error validando permisos' });
  }
}