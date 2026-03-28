import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getWatchlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const watchlist = await prisma.watchlist.findMany({
      where: { userId: req.userId },
      include: { stock: true },
      orderBy: { addedAt: 'desc' },
    });

    res.json(watchlist);
  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({ error: 'Failed to get watchlist' });
  }
};

export const addToWatchlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { stockId } = req.body;

    const existing = await prisma.watchlist.findUnique({
      where: { userId_stockId: { userId: req.userId!, stockId } },
    });

    if (existing) {
      res.status(400).json({ error: 'Stock already in watchlist' });
      return;
    }

    const entry = await prisma.watchlist.create({
      data: { userId: req.userId!, stockId },
      include: { stock: true },
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({ error: 'Failed to add to watchlist' });
  }
};

export const removeFromWatchlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stockId = String(req.params.stockId);

    await prisma.watchlist.delete({
      where: { userId_stockId: { userId: req.userId!, stockId } },
    });

    res.json({ message: 'Removed from watchlist' });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({ error: 'Failed to remove from watchlist' });
  }
};
