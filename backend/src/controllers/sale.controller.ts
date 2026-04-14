import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  initiateSale,
  confirmSale,
  cancelSale,
  getSaleByListing,
} from '../services/sale.service';

export async function initiate(req: AuthRequest, res: Response): Promise<void> {
  try {
    const buyerId   = req.user!.userId;
    const listingId = req.params.listingId as string;

    const sale = await initiateSale(listingId, buyerId);
    res.status(201).json(sale);
  } catch (error: any) {
    const map: Record<string, [number, string]> = {
      LISTING_NOT_FOUND:    [404, 'Publicación no encontrada'],
      LISTING_NOT_AVAILABLE:[400, 'La publicación no está disponible'],
      CANNOT_BUY_OWN:       [400, 'No puedes comprar tu propia publicación'],
      SALE_ALREADY_EXISTS:  [400, 'Ya existe una venta activa para esta publicación'],
    };
    const [status, message] = map[error.message] || [500, 'Error interno'];
    res.status(status).json({ error: message });
  }
}

export async function confirm(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId    = req.user!.userId;
    const listingId = req.params.listingId as string;
    const { role }  = req.body;

    if (role !== 'buyer' && role !== 'seller') {
      res.status(400).json({ error: 'Rol inválido' });
      return;
    }

    const result = await confirmSale(listingId, userId, role);
    res.json(result);
  } catch (error: any) {
    const map: Record<string, [number, string]> = {
      SALE_NOT_FOUND:    [404, 'Venta no encontrada'],
      ALREADY_COMPLETED: [400, 'La venta ya fue completada'],
      SALE_CANCELLED:    [400, 'La venta fue cancelada'],
      UNAUTHORIZED:      [403, 'No autorizado'],
      ALREADY_CONFIRMED: [400, 'Ya confirmaste esta venta'],
    };
    const [status, message] = map[error.message] || [500, 'Error interno'];
    res.status(status).json({ error: message });
  }
}

export async function cancel(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId    = req.user!.userId;
    const listingId = req.params.listingId as string;

    const result = await cancelSale(listingId, userId);
    res.json(result);
  } catch (error: any) {
    const map: Record<string, [number, string]> = {
      SALE_NOT_FOUND:    [404, 'Venta no encontrada'],
      ALREADY_COMPLETED: [400, 'La venta ya fue completada'],
      UNAUTHORIZED:      [403, 'No autorizado'],
    };
    const [status, message] = map[error.message] || [500, 'Error interno'];
    res.status(status).json({ error: message });
  }
}

export async function getSale(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId    = req.user!.userId;
    const listingId = req.params.listingId as string;

    const sale = await getSaleByListing(listingId, userId);
    res.json(sale);
  } catch (error: any) {
    const map: Record<string, [number, string]> = {
      SALE_NOT_FOUND: [404, 'Venta no encontrada'],
      UNAUTHORIZED:   [403, 'No autorizado'],
    };
    const [status, message] = map[error.message] || [500, 'Error interno'];
    res.status(status).json({ error: message });
  }
}