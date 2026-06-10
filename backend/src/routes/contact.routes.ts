import { Router, Request, Response } from 'express';
import { sendContactFeedbackEmail } from '../utils/email';
import rateLimit from 'express-rate-limit';

const router = Router();

const contactLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutos
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Ya enviaste un comentario recientemente. Intenta nuevamente en 30 minutos.',
  },
});

router.post('/', contactLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, message, user } = req.body;

    if (!message || String(message).trim().length < 5) {
      res.status(400).json({ error: 'Escribe un comentario un poco más detallado.' });
      return;
    }

    if (String(message).length > 2000) {
      res.status(400).json({ error: 'El comentario no puede superar los 2000 caracteres.' });
      return;
    }

    await sendContactFeedbackEmail({
      type: type || 'Comentario',
      message: String(message).trim(),
      user,
    });

    res.json({ message: 'Comentario enviado correctamente' });
  } catch (error) {
    console.error('CONTACT FEEDBACK ERROR:', error);
    res.status(500).json({ error: 'No se pudo enviar el comentario' });
  }
});

export default router;