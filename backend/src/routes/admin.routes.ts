import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import { getAdminUsersController } from '../controllers/admin.controller';

const router = Router();

router.get(
  '/users',
  authenticate,
  requireAdmin,
  getAdminUsersController
);

export default router;