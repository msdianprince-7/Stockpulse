import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getAlerts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const alerts = await prisma.alert.findMany({
      where: { userId: req.userId },
      include: { stock: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(alerts);
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Failed to get alerts' });
  }
};

export const createAlert = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { stockId, targetPrice, condition } = req.body;

    const alert = await prisma.alert.create({
      data: {
        userId: req.userId!,
        stockId,
        targetPrice,
        condition,
      },
      include: { stock: true },
    });

    res.status(201).json(alert);
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
};

export const deleteAlert = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.alert.delete({
      where: { id, userId: req.userId },
    });

    res.json({ message: 'Alert deleted' });
  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
};

export const toggleAlert = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const alert = await prisma.alert.findFirst({
      where: { id, userId: req.userId },
    });

    if (!alert) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }

    const updated = await prisma.alert.update({
      where: { id },
      data: { isActive: !alert.isActive },
      include: { stock: true },
    });

    res.json(updated);
  } catch (error) {
    console.error('Toggle alert error:', error);
    res.status(500).json({ error: 'Failed to toggle alert' });
  }
};
