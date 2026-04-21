import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getMyProfileController,
  updateMyProfileController,
  getPublicProfileController,
  getProfileCompletionStatusController,
} from '../controllers/profile.controller';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.get('/me', authenticate, getMyProfileController);
router.put('/me', authenticate, upload.single('avatar'), updateMyProfileController);
router.get('/completion-status', authenticate, getProfileCompletionStatusController);
router.get('/public/:username', getPublicProfileController);

export default router;