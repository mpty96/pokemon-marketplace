import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getChat,
  getMyConversations,
  unreadCount,
  uploadChatImageController,
} from '../controllers/chat.controller';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.get('/my',          authenticate, getMyConversations);
router.get('/unread',      authenticate, unreadCount);
router.post('/:listingId/images', authenticate, upload.array('images', 4), uploadChatImageController);
router.get('/:listingId',  authenticate, getChat);

export default router;