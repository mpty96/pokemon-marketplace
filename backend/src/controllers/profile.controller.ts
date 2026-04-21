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
    const file = req.file as Express.Multer.File | undefined;

    const profile = await upsertMyProfile(req.user!.userId, {
      ...req.body,
      avatarFile: file,
    });

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

    if (error.message === 'USERNAME_IN_USE') {
      res.status(409).json({ error: 'El nombre de usuario ya está en uso' });
      return;
    }

    if (typeof error.message === 'string' && error.message.startsWith('USERNAME_CHANGE_BLOCKED:')) {
      const daysLeft = error.message.split(':')[1];
      res.status(400).json({
        error: `Solo puedes cambiar tu usuario una vez cada 30 días. Te faltan ${daysLeft} día(s).`,
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