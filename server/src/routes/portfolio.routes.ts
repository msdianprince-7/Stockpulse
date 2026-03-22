import { Router } from 'express';
import { getPortfolio, addHolding, removeHolding, getTransactions } from '../controllers/portfolio.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', getPortfolio);
router.post('/holdings', addHolding);
router.put('/holdings/:stockId', removeHolding);
router.get('/transactions', getTransactions);

export default router;
