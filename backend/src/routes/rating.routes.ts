import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { create, getBySale, getByUser } from '../controllers/rating.controller';

const router = Router();

router.post('/',              authenticate, create);
router.get('/sale/:saleId',   authenticate, getBySale);
router.get('/user/:username', getByUser);

export default router;