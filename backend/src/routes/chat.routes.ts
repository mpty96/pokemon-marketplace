import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getChat, getMyConversations } from '../controllers/chat.controller';

const router = Router();

router.get('/my',         authenticate, getMyConversations);
router.get('/:listingId', authenticate, getChat);

export default router;