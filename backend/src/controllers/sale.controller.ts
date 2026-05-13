import { Response, Request } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  initiateSale,
  confirmSale,
  cancelSale,
  getSaleByListing,
  getListingSalesHistory,
} from '../services/sale.service';
import prisma from '../lib/prisma';

export async function initiate(req: AuthRequest, res: Response): Promise<void> {
  try {
    const buyerId   = req.user!.userId;
    const listingId = req.params.listingId as string;

    const quantity = Number(req.body.quantity || 1);
    const sale = await initiateSale(listingId, buyerId, quantity);
    res.status(201).json(sale);
  } catch (error: any) {
    const map: Record<string, [number, string]> = {
      LISTING_NOT_FOUND:    [404, 'Publicación no encontrada'],
      LISTING_NOT_AVAILABLE:[400, 'La publicación no está disponible'],
      ONLY_SELLER_CAN_INITIATE: [403, 'Solo el vendedor puede finalizar la venta'],
      BUYER_NOT_FOUND:          [400, 'Debe existir una conversación con el comprador antes de finalizar la venta'],
      SALE_ALREADY_EXISTS:      [400, 'Ya existe una venta activa para esta publicación'],
      INSUFFICIENT_STOCK: [400, 'No hay stock suficiente para esa cantidad'],
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

export async function getMyTransactions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;

    const sales = await prisma.sale.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
        status: 'COMPLETED',
      },
      orderBy: { completedAt: 'desc' },
      include: {
        listing: {
          select: { id: true, title: true, images: true, priceCLP: true },
        },
        buyer:  { select: { id: true, username: true } },
        seller: { select: { id: true, username: true } },
      },
    });

    const result = sales.map((s) => ({
      id:           s.id,
      listingId:    s.listingId,
      title:        s.listing.title,
      image:        s.listing.images[0] || null,
      priceCLP:     s.finalPriceCLP,
      quantity:     s.quantity || 1,
      completedAt:  s.completedAt,
      role:         s.sellerId === userId ? 'seller' : 'buyer',
      otherUser:    s.sellerId === userId ? s.buyer : s.seller,
    }));

    res.json(result);
  } catch {
    res.status(500).json({ error: 'Error al obtener transacciones' });
  }
}

export async function getRecentTransactions(req: Request, res: Response): Promise<void> {
  try {
    const search = String(req.query.search || '').trim();

    const sales = await prisma.sale.findMany({
      where: {
        status: 'COMPLETED',
        ...(search
          ? {
              OR: [
                { listing: { title: { contains: search, mode: 'insensitive' } } },
                { listing: { cardName: { contains: search, mode: 'insensitive' } } },
                { buyer: { username: { contains: search, mode: 'insensitive' } } },
                { seller: { username: { contains: search, mode: 'insensitive' } } },
              ],
            }
          : {}),
      },
      orderBy: { completedAt: 'desc' },
      take:    20,
      include: {
        listing: { select: { id: true, title: true, cardName: true, images: true, priceCLP: true } },
        buyer:   { select: { id: true, username: true } },
        seller:  { select: { id: true, username: true } },
      },
    });
    res.json(sales.map((s) => ({
      id:          s.id,
      listingId:   s.listingId,
      title:       s.listing.cardName || s.listing.title,
      image:       s.listing.images[0] || null,
      priceCLP:    s.finalPriceCLP,
      quantity:    s.quantity || 1,
      completedAt: s.completedAt,
      buyer:       s.buyer,
      seller:      s.seller,
    })));
  } catch {
    res.status(500).json({ error: 'Error al obtener transacciones recientes' });
  }
}


export async function getListingHistory(req: Request, res: Response): Promise<void> {
  try {
    const listingId = req.params.listingId as string;
    const range = (req.query.range as '7d' | '1m' | '6m' | '1y') || '1m';

    const validRanges = ['7d', '1m', '6m', '1y'];

    if (!validRanges.includes(range)) {
      res.status(400).json({ error: 'Rango inválido' });
      return;
    }

    const data = await getListingSalesHistory(listingId, range);
    res.json(data);
  } catch (error: any) {
    if (error.message === 'LISTING_NOT_FOUND') {
      res.status(404).json({ error: 'Publicación no encontrada' });
      return;
    }

    res.status(500).json({ error: 'Error al obtener historial de ventas' });
  }
}