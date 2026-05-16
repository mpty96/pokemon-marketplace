import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  createUserReport,
  getAdminReports,
  getAdminReportById,
  resolveAdminReport,
} from '../services/report.service';

export async function createReportController(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { reportedUsername, reason, description } = req.body;

    const report = await createUserReport(
      req.user!.userId,
      reportedUsername,
      reason,
      description
    );

    res.status(201).json(report);
  } catch (error: any) {
    if (error.message === 'USER_NOT_FOUND') {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    if (error.message === 'CANNOT_REPORT_SELF') {
      res.status(400).json({ error: 'No puedes reportarte a ti mismo' });
      return;
    }

    if (error.message === 'REPORT_ALREADY_PENDING') {
      res.status(409).json({ error: 'Ya tienes un reporte pendiente contra este usuario' });
      return;
    }

    if (error.message === 'REPORT_RATE_LIMIT') {
      res.status(429).json({
        error: 'Has enviado demasiados reportes recientemente. Intenta más tarde.',
      });
      return;
    }

    res.status(400).json({ error: error.message || 'Error al crear reporte' });
  }
}

export async function getAdminReportsController(req: AuthRequest, res: Response): Promise<void> {
  try {
    const status = req.query.status as string | undefined;
    const reports = await getAdminReports(status);
    res.json(reports);
  } catch {
    res.status(500).json({ error: 'Error al obtener reportes' });
  }
}

export async function getAdminReportByIdController(req: AuthRequest, res: Response): Promise<void> {
  try {
    const report = await getAdminReportById(req.params.id);
    res.json(report);
  } catch (error: any) {
    if (error.message === 'REPORT_NOT_FOUND') {
      res.status(404).json({ error: 'Reporte no encontrado' });
      return;
    }

    res.status(500).json({ error: 'Error al obtener reporte' });
  }
}

export async function resolveAdminReportController(req: AuthRequest, res: Response): Promise<void> {
  try {
    const report = await resolveAdminReport(req.params.id, req.body);
    res.json(report);
  } catch (error: any) {
    if (error.message === 'REPORT_NOT_FOUND') {
      res.status(404).json({ error: 'Reporte no encontrado' });
      return;
    }

    if (error.message === 'REPORT_ALREADY_RESOLVED') {
      res.status(400).json({ error: 'Este reporte ya fue resuelto' });
      return;
    }

    res.status(500).json({ error: 'Error al resolver reporte' });
  }
}