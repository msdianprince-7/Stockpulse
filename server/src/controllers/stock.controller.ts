import { Request, Response } from 'express';
import { prisma } from '../config/database';

export const searchStocks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, exchange, sector } = req.query;

    const stocks = await prisma.stock.findMany({
      where: {
        AND: [
          q ? {
            OR: [
              { symbol: { contains: String(q), mode: 'insensitive' } },
              { name: { contains: String(q), mode: 'insensitive' } },
            ],
          } : {},
          exchange ? { exchange: exchange as 'NSE' | 'BSE' } : {},
          sector ? { sector: String(sector) } : {},
        ],
      },
      take: 20,
      orderBy: { symbol: 'asc' },
    });

    res.json(stocks);
  } catch (error) {
    console.error('Search stocks error:', error);
    res.status(500).json({ error: 'Failed to search stocks' });
  }
};

export const getStockBySymbol = async (req: Request, res: Response): Promise<void> => {
  try {
    const symbol = String(req.params.symbol);

    const stock = await prisma.stock.findUnique({
      where: { symbol: symbol.toUpperCase() },
    });

    if (!stock) {
      res.status(404).json({ error: 'Stock not found' });
      return;
    }

    res.json(stock);
  } catch (error) {
    console.error('Get stock error:', error);
    res.status(500).json({ error: 'Failed to get stock' });
  }
};

export const getAllStocks = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stocks = await prisma.stock.findMany({
      orderBy: { symbol: 'asc' },
      take: 100,
    });

    res.json(stocks);
  } catch (error) {
    console.error('Get all stocks error:', error);
    res.status(500).json({ error: 'Failed to get stocks' });
  }
};

export const getTopGainers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stocks = await prisma.stock.findMany({
      orderBy: { currentPrice: 'desc' },
      take: 10,
    });

    res.json(stocks);
  } catch (error) {
    console.error('Get top gainers error:', error);
    res.status(500).json({ error: 'Failed to get top gainers' });
  }
};

export const getTopLosers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stocks = await prisma.stock.findMany({
      orderBy: { currentPrice: 'asc' },
      take: 10,
    });

    res.json(stocks);
  } catch (error) {
    console.error('Get top losers error:', error);
    res.status(500).json({ error: 'Failed to get top losers' });
  }
};
