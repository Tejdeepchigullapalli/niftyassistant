import { Router } from 'express';
import { getAlerts, createAlert, updateAlert, deleteAlert } from '../controllers/alertController';
import { requireMongoAuth } from '../middleware/requireMongoAuth';

const router = Router();

// Protect all alert routes
router.use(requireMongoAuth);

router.get('/', getAlerts);
router.post('/', createAlert);
router.put('/:id', updateAlert);
router.delete('/:id', deleteAlert);

export default router;
