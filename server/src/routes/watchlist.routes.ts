import { Router } from 'express';
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '../controllers/watchlist.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', getWatchlist);
router.post('/', addToWatchlist);
router.delete('/:stockId', removeFromWatchlist);

export default router;
