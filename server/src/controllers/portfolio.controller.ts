import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getPortfolio = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const portfolio = await prisma.portfolio.findMany({
      where: { userId: req.userId },
      include: { stock: true },
    });

    const portfolioWithPL = portfolio.map((item) => {
      const currentValue = item.stock.currentPrice * item.quantity;
      const investedValue = item.avgPrice * item.quantity;
      const profitLoss = currentValue - investedValue;
      const profitLossPercent = ((profitLoss / investedValue) * 100);

      return {
        ...item,
        currentValue,
        investedValue,
        profitLoss,
        profitLossPercent: parseFloat(profitLossPercent.toFixed(2)),
      };
    });

    const totalInvested = portfolioWithPL.reduce((sum: number, item: { investedValue: number }) => sum + item.investedValue, 0);
    const totalCurrent = portfolioWithPL.reduce((sum: number, item: { currentValue: number }) => sum + item.currentValue, 0);
    const totalPL = totalCurrent - totalInvested;

    res.json({
      holdings: portfolioWithPL,
      summary: {
        totalInvested: parseFloat(totalInvested.toFixed(2)),
        totalCurrent: parseFloat(totalCurrent.toFixed(2)),
        totalProfitLoss: parseFloat(totalPL.toFixed(2)),
        totalProfitLossPercent: totalInvested > 0 ? parseFloat(((totalPL / totalInvested) * 100).toFixed(2)) : 0,
      },
    });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ error: 'Failed to get portfolio' });
  }
};

export const addHolding = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { stockId, quantity, avgPrice } = req.body;

    const existing = await prisma.portfolio.findUnique({
      where: { userId_stockId: { userId: req.userId!, stockId } },
    });

    if (existing) {
      // Average out the price
      const totalQty = existing.quantity + quantity;
      const newAvgPrice = ((existing.avgPrice * existing.quantity) + (avgPrice * quantity)) / totalQty;

      const updated = await prisma.portfolio.update({
        where: { id: existing.id },
        data: { quantity: totalQty, avgPrice: parseFloat(newAvgPrice.toFixed(2)) },
        include: { stock: true },
      });

      // Record transaction
      await prisma.transaction.create({
        data: {
          userId: req.userId!,
          stockId,
          type: 'BUY',
          quantity,
          price: avgPrice,
          total: quantity * avgPrice,
        },
      });

      res.json(updated);
    } else {
      const holding = await prisma.portfolio.create({
        data: { userId: req.userId!, stockId, quantity, avgPrice },
        include: { stock: true },
      });

      await prisma.transaction.create({
        data: {
          userId: req.userId!,
          stockId,
          type: 'BUY',
          quantity,
          price: avgPrice,
          total: quantity * avgPrice,
        },
      });

      res.status(201).json(holding);
    }
  } catch (error) {
    console.error('Add holding error:', error);
    res.status(500).json({ error: 'Failed to add holding' });
  }
};

export const removeHolding = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { stockId } = req.params;
    const { quantity, price } = req.body;

    const existing = await prisma.portfolio.findUnique({
      where: { userId_stockId: { userId: req.userId!, stockId } },
    });

    if (!existing) {
      res.status(404).json({ error: 'Holding not found' });
      return;
    }

    if (quantity >= existing.quantity) {
      await prisma.portfolio.delete({ where: { id: existing.id } });
    } else {
      await prisma.portfolio.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity - quantity },
      });
    }

    await prisma.transaction.create({
      data: {
        userId: req.userId!,
        stockId,
        type: 'SELL',
        quantity,
        price,
        total: quantity * price,
      },
    });

    res.json({ message: 'Holding updated' });
  } catch (error) {
    console.error('Remove holding error:', error);
    res.status(500).json({ error: 'Failed to remove holding' });
  }
};

export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.userId },
      include: { stock: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
};
