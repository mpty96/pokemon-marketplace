import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getChat,
  getMyConversations,
  unreadCount,
  uploadChatImageController,
  sendChatMessageController,
} from '../controllers/chat.controller';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.get('/my',          authenticate, getMyConversations);
router.get('/unread',      authenticate, unreadCount);
router.post('/:listingId/images', authenticate, upload.array('images', 4), uploadChatImageController);
router.post('/:listingId/messages', authenticate, sendChatMessageController);
router.get('/:listingId',  authenticate, getChat);

export default router;