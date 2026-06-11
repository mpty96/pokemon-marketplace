import { Request, Response } from 'express';
import { getAdminUsers } from '../services/admin.service';

export async function getAdminUsersController(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const users = await getAdminUsers();
    res.json(users);
  } catch {
    res.status(500).json({
      error: 'Error al obtener usuarios',
    });
  }
}