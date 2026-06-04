import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { analyzeCardPricing } from '../services/cardPricing.service';

const VALID_CONDITIONS = ['MINT', 'NEAR_MINT', 'EXCELLENT', 'GOOD', 'PLAYED', 'POOR'];
const VALID_LANGUAGES = ['ESP', 'ENG', 'POR', 'JPN', 'KOR', 'CHN', 'OTHER'];

export async function analyzeCardPricingController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { cardName, edition, setNumber, language, condition } = req.body;

    if (!cardName || !language || !condition) {
      res.status(400).json({ error: 'Faltan campos requeridos' });
      return;
    }

    if (!VALID_LANGUAGES.includes(language)) {
      res.status(400).json({ error: 'Idioma inválido' });
      return;
    }

    if (!VALID_CONDITIONS.includes(condition)) {
      res.status(400).json({ error: 'Condición inválida' });
      return;
    }

    const result = await analyzeCardPricing({
      cardName: String(cardName).trim(),
      edition: edition ? String(edition).trim() : '',
      setNumber: setNumber ? String(setNumber).trim() : undefined,
      language,
      condition,
    });

    res.json(result);
  } catch (error) {
    console.error('CARD PRICING ERROR:', error);
    res.status(500).json({ error: 'Error al analizar precio de carta' });
  }
}