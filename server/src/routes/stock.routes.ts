import { Router } from 'express';
import { searchStocks, getStockBySymbol, getAllStocks, getTopGainers, getTopLosers, getChartData } from '../controllers/stock.controller';

const router = Router();

router.get('/search', searchStocks);
router.get('/all', getAllStocks);
router.get('/top-gainers', getTopGainers);
router.get('/top-losers', getTopLosers);
router.get('/:symbol/chart', getChartData);
router.get('/:symbol', getStockBySymbol);

export default router;
