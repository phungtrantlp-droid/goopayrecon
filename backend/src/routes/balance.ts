import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { balanceService } from '../services/balanceService';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/', async (req: Request, res: Response) => {
  try {
    const { partnerCode, dateFrom, dateTo, connectorCode } = req.query;
    
    if (!dateFrom || !dateTo) {
      return res.status(400).json({ success: false, message: 'dateFrom and dateTo are required' });
    }

    const dFrom = new Date(dateFrom as string);
    const dTo = new Date(dateTo as string);

    let txWhere: any = {};
    if (connectorCode) {
      txWhere.connectorCode = connectorCode;
    }
    // To calculate opening balance, we need all transactions before dateTo
    txWhere.date = { lte: dTo };
    
    const transactions = await prisma.transaction.findMany({
      where: txWhere,
      include: { partner: true }
    });

    const results = balanceService.calculateCumulative(transactions, dFrom, dTo, partnerCode as string);
    res.json({ success: true, data: results });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to calculate balance' });
  }
});

export default router;
