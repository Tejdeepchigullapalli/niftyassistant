import { Router } from 'express';
import { getCompanyStates, updateWatchlist, setInterested, markPurchased, removePurchased, saveNote } from '../controllers/companyStateController';
import { requireMongoAuth } from '../middleware/requireMongoAuth';

const router = Router();

// Protect all routes with custom cookie session checker
router.use(requireMongoAuth);

router.get('/', getCompanyStates);
router.post('/watchlist', updateWatchlist);
router.post('/interested', setInterested);
router.post('/purchase', markPurchased);
router.post('/purchase/delete', removePurchased);
router.post('/notes', saveNote);

export default router;
