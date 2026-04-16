import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { initiate, confirm, cancel, getSale, getMyTransactions } from '../controllers/sale.controller';

const router = Router();

router.post('/:listingId/initiate', authenticate, initiate);
router.post('/:listingId/confirm',  authenticate, confirm);
router.post('/:listingId/cancel',   authenticate, cancel);
router.get('/:listingId',           authenticate, getSale);
router.get('/my', authenticate, getMyTransactions); // 👈 antes de /:listingId

export default router;