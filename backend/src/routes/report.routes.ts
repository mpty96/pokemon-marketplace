import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import {
  createReportController,
  getAdminReportsController,
  getAdminReportByIdController,
  resolveAdminReportController,
} from '../controllers/report.controller';

const router = Router();

router.post('/', authenticate, createReportController);

router.get('/admin', authenticate, requireAdmin, getAdminReportsController);
router.get('/admin/:id', authenticate, requireAdmin, getAdminReportByIdController);
router.patch('/admin/:id', authenticate, requireAdmin, resolveAdminReportController);

export default router;