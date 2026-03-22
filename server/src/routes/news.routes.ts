import { Router } from 'express';
import { getNews, getMarketNews, getStockNews } from '../controllers/news.controller';

const router = Router();

router.get('/', getNews);
router.get('/market', getMarketNews);
router.get('/stock/:symbol', getStockNews);

export default router;
