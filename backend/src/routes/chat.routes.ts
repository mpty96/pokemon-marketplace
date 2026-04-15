import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getChat, getMyConversations, unreadCount } from '../controllers/chat.controller';

const router = Router();

router.get('/my',          authenticate, getMyConversations);
router.get('/unread',      authenticate, unreadCount);
router.get('/:listingId',  authenticate, getChat);

export default router;