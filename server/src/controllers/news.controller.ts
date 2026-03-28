import { Request, Response } from 'express';
import { stockService } from '../services/stock.service';

export const getNews = async (_req: Request, res: Response): Promise<void> => {
  try {
    const news = await stockService.getMarketNews();
    const formatted = formatNews(news);
    res.json(formatted);
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ error: 'Failed to get news' });
  }
};

export const getMarketNews = async (_req: Request, res: Response): Promise<void> => {
  try {
    const news = await stockService.getMarketNews();
    const formatted = formatNews(news);
    res.json(formatted);
  } catch (error) {
    console.error('Get market news error:', error);
    res.status(500).json({ error: 'Failed to get market news' });
  }
};

export const getStockNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const symbol = String(req.params.symbol).toUpperCase();
    const news = await stockService.getCompanyNews(symbol);
    const formatted = formatNews(news);
    res.json(formatted);
  } catch (error) {
    console.error('Get stock news error:', error);
    res.status(500).json({ error: 'Failed to get stock news' });
  }
};

function formatNews(news: any[]) {
  return news.map((article: any) => ({
    id: article.uuid || Math.random().toString(36).substring(7),
    title: article.title,
    description: article.title,
    url: article.link,
    imageUrl: article.thumbnail?.resolutions?.[0]?.url || null,
    source: article.publisher,
    publishedAt: article.providerPublishTime
      ? new Date(article.providerPublishTime * 1000).toISOString()
      : new Date().toISOString(),
    relatedTickers: article.relatedTickers || [],
  }));
}
