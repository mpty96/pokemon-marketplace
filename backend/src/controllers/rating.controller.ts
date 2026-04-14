import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  createRating,
  getRatingsBySale,
  getRatingsByUser,
} from '../services/rating.service';

export async function create(req: AuthRequest, res: Response): Promise<void> {
  try {
    const raterId = req.user!.userId;
    const { saleId, priceScore, communicationScore, processScore, comment } = req.body;

    if (!saleId || !priceScore || !communicationScore || !processScore) {
      res.status(400).json({ error: 'Todos los scores son requeridos' });
      return;
    }

    const rating = await createRating(
      saleId,
      raterId,
      Number(priceScore),
      Number(communicationScore),
      Number(processScore),
      comment
    );

    res.status(201).json(rating);
  } catch (error: any) {
    const map: Record<string, [number, string]> = {
      SALE_NOT_FOUND:     [404, 'Venta no encontrada'],
      SALE_NOT_COMPLETED: [400, 'La venta no está completada'],
      UNAUTHORIZED:       [403, 'No autorizado'],
      ALREADY_RATED:      [400, 'Ya calificaste esta venta'],
      INVALID_SCORE:      [400, 'Los scores deben ser entre 1 y 5'],
    };
    const [status, message] = map[error.message] || [500, 'Error interno'];
    res.status(status).json({ error: message });
  }
}

export async function getBySale(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const saleId = req.params.saleId as string;
    const data   = await getRatingsBySale(saleId, userId);
    res.json(data);
  } catch (error: any) {
    const map: Record<string, [number, string]> = {
      SALE_NOT_FOUND: [404, 'Venta no encontrada'],
      UNAUTHORIZED:   [403, 'No autorizado'],
    };
    const [status, message] = map[error.message] || [500, 'Error interno'];
    res.status(status).json({ error: message });
  }
}

export async function getByUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { username } = req.params;
    const data = await getRatingsByUser(username as string);
    res.json(data);
  } catch (error: any) {
    if (error.message === 'USER_NOT_FOUND') {
      res.status(404).json({ error: 'Usuario no encontrado' });
    } else {
      res.status(500).json({ error: 'Error interno' });
    }
  }
}