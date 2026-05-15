import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getChat,
  getMyConversations,
  unreadCount,
  uploadChatImageController,
  sendChatMessageController,
  deleteConversationsController,
} from '../controllers/chat.controller';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.get('/my',          authenticate, getMyConversations);
router.get('/unread',      authenticate, unreadCount);
router.post('/:listingId/images', authenticate, upload.array('images', 4), uploadChatImageController);
router.post('/:listingId/messages', authenticate, sendChatMessageController);
router.delete('/conversations/bulk', authenticate, deleteConversationsController);
router.get('/:listingId',  authenticate, getChat);

export default router;