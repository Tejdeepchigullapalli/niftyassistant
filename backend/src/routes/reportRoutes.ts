import { Router } from 'express';
import Express from 'express';
import { uploadReport, downloadReport, deleteReport, getUserReports } from '../controllers/reportController';
import { requireAnyAuth } from '../middleware/requireAnyAuth';

const router = Router();

// Protect all report endpoints
router.use(requireAnyAuth);

// Raw parser specifically for PDF uploads to populate req.body as Buffer
router.post('/upload', Express.raw({ type: 'application/pdf', limit: '5mb' }), uploadReport);
router.get('/', getUserReports);
router.get('/:reportId/download', downloadReport);
router.delete('/:reportId', deleteReport);

export default router;
