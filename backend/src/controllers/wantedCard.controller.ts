import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';

import {
  getMyWantedCards,
  getPublicWantedCards,
  createWantedCard,
  deleteWantedCard,
} from '../services/wantedCard.service';

export async function getMyWantedCardsController(
  req: AuthRequest,
  res: Response
) {
  try {
    const cards = await getMyWantedCards(req.user!.userId);
    res.json(cards);
  } catch {
    res.status(500).json({
      error: 'Error al obtener cartas de interés',
    });
  }
}

export async function getPublicWantedCardsController(
  req: AuthRequest,
  res: Response
) {
  try {
    const cards = await getPublicWantedCards(req.params.username);
    res.json(cards);
  } catch (error: any) {
    if (error.message === 'USER_NOT_FOUND') {
      res.status(404).json({
        error: 'Usuario no encontrado',
      });
      return;
    }

    res.status(500).json({
      error: 'Error al obtener cartas',
    });
  }
}

export async function createWantedCardController(
  req: AuthRequest,
  res: Response
) {
  try {
    const file = req.file as Express.Multer.File | undefined;

    const card = await createWantedCard(
      req.user!.userId,
      {
        ...req.body,
        imageFile: file,
      }
    );

    res.status(201).json(card);
  } catch {
    res.status(500).json({
      error: 'Error al crear carta',
    });
  }
}

export async function deleteWantedCardController(
  req: AuthRequest,
  res: Response
) {
  try {
    await deleteWantedCard(
      req.user!.userId,
      req.params.id
    );

    res.json({
      success: true,
    });
  } catch (error: any) {
    if (error.message === 'FORBIDDEN') {
      res.status(403).json({
        error: 'No autorizado',
      });
      return;
    }

    res.status(404).json({
      error: 'Carta no encontrada',
    });
  }
}