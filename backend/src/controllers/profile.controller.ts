import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  getMyProfile,
  upsertMyProfile,
  getPublicProfileByUsername,
  getProfileCompletionStatus,
} from '../services/profile.service';

export async function getMyProfileController(req: AuthRequest, res: Response): Promise<void> {
  try {
    const profile = await getMyProfile(req.user!.userId);
    res.json(profile);
  } catch {
    res.status(500).json({ error: 'Error al obtener mi perfil' });
  }
}

export async function updateMyProfileController(req: AuthRequest, res: Response): Promise<void> {
  try {
    const profile = await upsertMyProfile(req.user!.userId, req.body);
    res.json(profile);
  } catch (error: any) {
    if (typeof error.message === 'string' && error.message.startsWith('IMMUTABLE_FIELD:')) {
      const field = error.message.split(':')[1];

      const labels: Record<string, string> = {
        location: 'Locación',
        rut: 'RUT',
        contactPhone: 'Número de contacto',
      };

      res.status(400).json({
        error: `${labels[field] || field} no se puede modificar una vez guardado`,
      });
      return;
    }

    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
}

export async function getPublicProfileController(req: AuthRequest, res: Response): Promise<void> {
  try {
    const username = req.params.username as string;
    const profile = await getPublicProfileByUsername(username);
    res.json(profile);
  } catch (error: any) {
    if (error.message === 'USER_NOT_FOUND') {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.status(500).json({ error: 'Error al obtener perfil público' });
  }
}

export async function getProfileCompletionStatusController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const result = await getProfileCompletionStatus(req.user!.userId);
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Error al obtener estado del perfil' });
  }
}