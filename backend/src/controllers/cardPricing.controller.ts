import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { analyzeCardPricing } from '../services/cardPricing.service';

const VALID_LANGUAGES = ['ESP', 'ENG', 'POR', 'JPN', 'KOR', 'CHN', 'OTHER'];

export async function analyzeCardPricingController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { cardName, edition, setNumber, language } = req.body;

    if (!cardName || !language) {
      res.status(400).json({ error: 'Faltan campos requeridos' });
      return;
    }

    if (!VALID_LANGUAGES.includes(language)) {
      res.status(400).json({ error: 'Idioma inválido' });
      return;
    }

    const result = await analyzeCardPricing({
      cardName: String(cardName).trim(),
      edition: edition ? String(edition).trim() : '',
      setNumber: setNumber ? String(setNumber).trim() : undefined,
      language,
      condition: 'NEAR_MINT',
    });

    res.json(result);
  } catch (error) {
    console.error('CARD PRICING ERROR:', error);
    res.status(500).json({ error: 'Error al analizar precio de carta' });
  }
}