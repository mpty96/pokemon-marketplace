import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { getConversation, getUserConversations, getUnreadCount } from '../services/chat.service';

export async function getChat(req: AuthRequest, res: Response): Promise<void> {
  try {
    const listingId = req.params.listingId as string;
    const userId    = req.user!.userId;
    const data      = await getConversation(listingId, userId);
    res.json(data);
  } catch (error: any) {
    if (error.message === 'LISTING_NOT_FOUND') {
      res.status(404).json({ error: 'Publicación no encontrada' });
    } else {
      res.status(500).json({ error: 'Error al obtener el chat' });
    }
  }
}

export async function getMyConversations(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const data   = await getUserConversations(userId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener conversaciones' });
  }
}

export async function unreadCount(req: AuthRequest, res: Response): Promise<void> {
  try {
    const count = await getUnreadCount(req.user!.userId);
    res.json({ count });
  } catch {
    res.status(500).json({ error: 'Error al obtener no leídos' });
  }
}