import { Router } from 'express';
import { register, verify, login, refresh, me } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.get('/verify-email', verify);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/me', authenticate, me);

export default router;