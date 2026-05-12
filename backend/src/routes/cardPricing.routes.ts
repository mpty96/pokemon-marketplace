import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { analyzeCardPricingController } from '../controllers/cardPricing.controller';

const router = Router();

router.post('/analyze', authenticate, analyzeCardPricingController);

export default router;