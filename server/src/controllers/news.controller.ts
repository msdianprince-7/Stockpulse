import { Request, Response } from 'express';
import { prisma } from '../config/database';

export const getNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { stockId, sentiment, limit } = req.query;

    const news = await prisma.news.findMany({
      where: {
        ...(stockId ? { stockId: String(stockId) } : {}),
        ...(sentiment ? { sentiment: sentiment as 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' } : {}),
      },
      include: { stock: true },
      orderBy: { publishedAt: 'desc' },
      take: Number(limit) || 20,
    });

    res.json(news);
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ error: 'Failed to get news' });
  }
};

export const getMarketNews = async (_req: Request, res: Response): Promise<void> => {
  try {
    const news = await prisma.news.findMany({
      where: { stockId: null },
      orderBy: { publishedAt: 'desc' },
      take: 20,
    });

    res.json(news);
  } catch (error) {
    console.error('Get market news error:', error);
    res.status(500).json({ error: 'Failed to get market news' });
  }
};

export const getStockNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const symbol = String(req.params.symbol);

    const stock = await prisma.stock.findUnique({ where: { symbol: symbol.toUpperCase() } });
    if (!stock) {
      res.status(404).json({ error: 'Stock not found' });
      return;
    }

    const news = await prisma.news.findMany({
      where: { stockId: stock.id },
      orderBy: { publishedAt: 'desc' },
      take: 20,
    });

    res.json(news);
  } catch (error) {
    console.error('Get stock news error:', error);
    res.status(500).json({ error: 'Failed to get stock news' });
  }
};
