import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
  getMyListings,
} from '../services/listing.service';

// Tipos locales — evita importar enums desde @prisma/client
type CardCondition = 'MINT' | 'NEAR_MINT' | 'EXCELLENT' | 'GOOD' | 'PLAYED' | 'POOR';
type CardRarity    = 'COMMON' | 'UNCOMMON' | 'RARE' | 'HOLO_RARE' | 'ULTRA_RARE' | 'SECRET_RARE' | 'PROMO';

export async function create(req: AuthRequest, res: Response): Promise<void> {
  try {
    const sellerId = req.user!.userId;
    const {
      title, cardName, edition, setNumber,
      condition, rarity, priceCLP, description,
    } = req.body;

    if (!title || !cardName || !edition || !condition || !rarity || !priceCLP) {
      res.status(400).json({ error: 'Faltan campos requeridos' });
      return;
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ error: 'Debes subir al menos una imagen' });
      return;
    }

    const listing = await createListing({
      sellerId,
      title,
      cardName,
      edition,
      setNumber,
      condition: condition as CardCondition,
      rarity:    rarity    as CardRarity,
      priceCLP:  Number(priceCLP),
      description,
      imageFiles: files.map((f) => f.buffer),
    });

    res.status(201).json(listing);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la publicación' });
  }
}

export async function list(req: AuthRequest, res: Response): Promise<void> {
  try {
    const {
      search, edition, condition, rarity,
      minPrice, maxPrice, page, limit,
    } = req.query;

    const result = await getListings({
      search:    search    as string,
      edition:   edition   as string,
      condition: condition as CardCondition,
      rarity:    rarity    as CardRarity,
      minPrice:  minPrice  ? Number(minPrice)  : undefined,
      maxPrice:  maxPrice  ? Number(maxPrice)  : undefined,
      page:      page      ? Number(page)      : 1,
      limit:     limit     ? Number(limit)     : 12,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener publicaciones' });
  }
}

export async function getOne(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const listing = await getListingById(id);
    res.json(listing);
  } catch (error: any) {
    if (error.message === 'LISTING_NOT_FOUND') {
      res.status(404).json({ error: 'Publicación no encontrada' });
    } else {
      res.status(500).json({ error: 'Error al obtener la publicación' });
    }
  }
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id       = req.params.id as string;
    const sellerId = req.user!.userId;
    const listing  = await updateListing(id, sellerId, req.body);
    res.json(listing);
  } catch (error: any) {
    if (error.message === 'LISTING_NOT_FOUND') {
      res.status(404).json({ error: 'Publicación no encontrada' });
    } else if (error.message === 'UNAUTHORIZED') {
      res.status(403).json({ error: 'No autorizado' });
    } else if (error.message === 'LISTING_NOT_EDITABLE') {
      res.status(400).json({ error: 'La publicación no se puede editar en este estado' });
    } else {
      res.status(500).json({ error: 'Error al actualizar' });
    }
  }
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id       = req.params.id as string;
    const sellerId = req.user!.userId;
    const result   = await deleteListing(id, sellerId);
    res.json(result);
  } catch (error: any) {
    if (error.message === 'LISTING_NOT_FOUND') {
      res.status(404).json({ error: 'Publicación no encontrada' });
    } else if (error.message === 'UNAUTHORIZED') {
      res.status(403).json({ error: 'No autorizado' });
    } else if (error.message === 'LISTING_IN_SALE') {
      res.status(400).json({ error: 'No puedes eliminar una publicación en proceso de venta' });
    } else {
      res.status(500).json({ error: 'Error al eliminar' });
    }
  }
}

export async function myListings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const listings = await getMyListings(req.user!.userId);
    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tus publicaciones' });
  }
}