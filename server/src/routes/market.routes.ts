import { Router } from 'express';
import { getMarketStatus } from '../controllers/market.controller';

const router = Router();

router.get('/status', getMarketStatus);

export default router;
