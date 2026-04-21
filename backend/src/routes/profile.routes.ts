import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getMyProfileController,
  updateMyProfileController,
  getPublicProfileController,
  getProfileCompletionStatusController,
} from '../controllers/profile.controller';

const router = Router();

router.get('/me', authenticate, getMyProfileController);
router.put('/me', authenticate, updateMyProfileController);
router.get('/completion-status', authenticate, getProfileCompletionStatusController);
router.get('/public/:username', getPublicProfileController);

export default router;