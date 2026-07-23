import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import { reconcileService } from '../services/reconcileService';
import bcrypt from 'bcryptjs';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/', async (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo, connectorCode } = req.query;
    let where: any = {};
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom as string);
      if (dateTo) where.date.lte = new Date(dateTo as string);
    }
    if (connectorCode) where.connectorCode = connectorCode;

    const transactions = await prisma.transaction.findMany({ where });
    const grouped = reconcileService.groupByDateConnector(transactions);
    res.json({ success: true, data: grouped });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch' });
  }
});

router.post('/lock', authorize(['ADMIN', 'EDITOR']), async (req: Request, res: Response) => {
  try {
    const { date, connectorCode } = req.body;
    if (!date || !connectorCode) return res.status(400).json({ success: false, message: 'Missing params' });

    await prisma.transaction.updateMany({
      where: { date: new Date(date), connectorCode },
      data: { isLocked: true }
    });
    res.json({ success: true, message: 'Locked' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to lock' });
  }
});

router.post('/unlock', authorize(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const { date, connectorCode, adminPassword } = req.body;
    if (!date || !connectorCode || !adminPassword) return res.status(400).json({ success: false, message: 'Missing params' });

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isValid = await bcrypt.compare(adminPassword, user.passwordHash);
    if (!isValid) return res.status(403).json({ success: false, message: 'Invalid password' });

    await prisma.transaction.updateMany({
      where: { date: new Date(date), connectorCode },
      data: { isLocked: false }
    });
    res.json({ success: true, message: 'Unlocked' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to unlock' });
  }
});

export default router;
