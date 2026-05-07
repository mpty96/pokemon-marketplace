import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  getConversation,
  getUserConversations,
  getUnreadCount,
  uploadChatImage,
} from '../services/chat.service';

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

export async function uploadChatImageController(req: AuthRequest, res: Response): Promise<void> {
  try {
    const file = req.file as Express.Multer.File | undefined;

    if (!file) {
      res.status(400).json({ error: 'Debes subir una imagen' });
      return;
    }

    const imageUrl = await uploadChatImage(file.buffer);

    res.json({ imageUrl });
  } catch (error) {
    console.error('UPLOAD CHAT IMAGE ERROR:', error);
    res.status(500).json({ error: 'Error al subir imagen del chat' });
  }
}