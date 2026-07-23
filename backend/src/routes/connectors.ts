import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/', async (req: Request, res: Response) => {
  try {
    const { isActive } = req.query;
    const where = isActive !== undefined ? { isActive: isActive === 'true' } : {};
    
    const connectors = await prisma.connector.findMany({
      where,
      orderBy: { connectorCode: 'asc' }
    });
    res.json({ success: true, data: connectors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch connectors' });
  }
});

router.get('/:code', async (req: Request, res: Response) => {
  try {
    const connector = await prisma.connector.findUnique({
      where: { connectorCode: req.params.code }
    });
    if (!connector) return res.status(404).json({ success: false, message: 'Connector not found' });
    res.json({ success: true, data: connector });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch connector' });
  }
});

router.post('/', authorize(['ADMIN', 'EDITOR']), async (req: Request, res: Response) => {
  try {
    const connector = await prisma.connector.create({ data: req.body });
    res.status(201).json({ success: true, data: connector });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create connector' });
  }
});

router.put('/:code', authorize(['ADMIN', 'EDITOR']), async (req: Request, res: Response) => {
  try {
    const connector = await prisma.connector.update({
      where: { connectorCode: req.params.code },
      data: req.body
    });
    res.json({ success: true, data: connector });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update connector' });
  }
});

router.patch('/:code/toggle-active', authorize(['ADMIN', 'EDITOR']), async (req: Request, res: Response) => {
  try {
    const connector = await prisma.connector.findUnique({ where: { connectorCode: req.params.code } });
    if (!connector) return res.status(404).json({ success: false, message: 'Not found' });

    const updated = await prisma.connector.update({
      where: { connectorCode: req.params.code },
      data: { isActive: !connector.isActive }
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to toggle connector' });
  }
});

router.delete('/:code', authorize(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const txCount = await prisma.transaction.count({
      where: { connectorCode: req.params.code }
    });
    if (txCount > 0) {
      return res.status(409).json({ success: false, message: 'Cannot delete connector with existing transactions' });
    }

    await prisma.connector.delete({ where: { connectorCode: req.params.code } });
    res.json({ success: true, message: 'Connector deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to delete connector' });
  }
});

export default router;
