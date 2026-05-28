import { Router } from 'express';

import { authenticate } from '../middleware/auth.middleware';

import { upload } from '../middleware/upload.middleware';

import {
  getMyWantedCardsController,
  getPublicWantedCardsController,
  createWantedCardController,
  deleteWantedCardController,
} from '../controllers/wantedCard.controller';

const router = Router();

router.get(
  '/me',
  authenticate,
  getMyWantedCardsController
);

router.get(
  '/user/:username',
  getPublicWantedCardsController
);

router.post(
  '/',
  authenticate,
  upload.single('image'),
  createWantedCardController
);

router.delete(
  '/:id',
  authenticate,
  deleteWantedCardController
);

export default router;