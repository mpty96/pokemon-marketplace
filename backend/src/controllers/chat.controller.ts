import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  getConversation,
  getUserConversations,
  getUnreadCount,
  uploadChatImages,
  sendChatMessage,
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
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      res.status(400).json({ error: 'Debes subir al menos una imagen' });
      return;
    }

    if (files.length > 4) {
      res.status(400).json({ error: 'Máximo 4 imágenes por mensaje' });
      return;
    }

    const imageUrls = await uploadChatImages(files.map((file) => file.buffer));

    res.json({ imageUrls });
  } catch (error) {
    console.error('UPLOAD CHAT IMAGES ERROR:', error);
    res.status(500).json({ error: 'Error al subir imágenes del chat' });
  }
}

export async function sendChatMessageController(req: AuthRequest, res: Response): Promise<void> {
  try {
    const listingId = req.params.listingId as string;
    const userId = req.user!.userId;
    const { content, imageUrls = [] } = req.body;

    const message = await sendChatMessage(listingId, userId, content, imageUrls);

    res.status(201).json(message);
  } catch (error: any) {
    if (error.message === 'LISTING_NOT_FOUND') {
      res.status(404).json({ error: 'Publicación no encontrada' });
      return;
    }

    if (error.message === 'EMPTY_MESSAGE') {
      res.status(400).json({ error: 'El mensaje está vacío' });
      return;
    }

    console.error('SEND CHAT MESSAGE ERROR:', error);
    res.status(500).json({ error: 'Error al enviar mensaje' });
  }
}