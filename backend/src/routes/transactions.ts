import { Router, Request, Response } from 'express';
import { PrismaClient, TransactionType } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import multer from 'multer';
import { excelService } from '../services/excelService';

const router = Router();
const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);

router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, dateFrom, dateTo, partnerCode, connectorCode, parentPartnerCode } = req.query;
    let where: any = {};

    if (type) where.type = type as TransactionType;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom as string);
      if (dateTo) where.date.lte = new Date(dateTo as string);
    }
    if (connectorCode) where.connectorCode = connectorCode;
    
    if (parentPartnerCode) {
      const children = await prisma.partner.findMany({ where: { parentId: parentPartnerCode as string } });
      const codes = children.map(c => c.partnerCode);
      codes.push(parentPartnerCode as string);
      if (partnerCode) {
        if (codes.includes(partnerCode as string)) {
          where.partnerCode = partnerCode;
        } else {
          where.partnerCode = 'NONE';
        }
      } else {
        where.partnerCode = { in: codes };
      }
    } else if (partnerCode) {
      where.partnerCode = partnerCode;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: { partner: true, connector: true },
      orderBy: { date: 'desc' }
    });
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
  }
});

router.get('/template/:type/download', (req: Request, res: Response) => {
  const { type } = req.params;
  const isQuyetToan = type.toUpperCase() === 'QUYET_TOAN';
  const headers = isQuyetToan 
    ? ['Ngày', 'Mã đối tác', 'Loại giao dịch', 'Số lượng', 'Số tiền', 'Connector', 'Mã giao dịch']
    : ['Ngày', 'Mã đối tác', 'Loại giao dịch', 'Số lượng', 'Số tiền', 'Connector', 'Mã giao dịch', 'Tên ngân hàng'];
  
  const buffer = excelService.generateTemplate(headers, type);
  res.setHeader('Content-Disposition', `attachment; filename="template_${type}.xlsx"`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const tx = await prisma.transaction.findUnique({
      where: { id: Number(req.params.id) },
      include: { partner: true, connector: true }
    });
    if (!tx) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: tx });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch' });
  }
});

router.post('/', authorize(['ADMIN', 'EDITOR']), async (req: Request, res: Response) => {
  try {
    const { connectorCode } = req.body;
    const connector = await prisma.connector.findUnique({ where: { connectorCode } });
    if (!connector || !connector.isActive) {
      return res.status(400).json({ success: false, message: 'Invalid or inactive connector' });
    }

    const tx = await prisma.transaction.create({
      data: { ...req.body, date: new Date(req.body.date) }
    });
    res.status(201).json({ success: true, data: tx });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create transaction' });
  }
});

router.put('/:id', authorize(['ADMIN', 'EDITOR']), async (req: Request, res: Response) => {
  try {
    const existing = await prisma.transaction.findUnique({ where: { id: Number(req.params.id) } });
    if (!existing) return res.status(404).json({ success: false, message: 'Not found' });
    if (existing.isLocked) return res.status(403).json({ success: false, message: 'Transaction is locked' });

    const tx = await prisma.transaction.update({
      where: { id: Number(req.params.id) },
      data: { ...req.body, date: req.body.date ? new Date(req.body.date) : undefined }
    });
    res.json({ success: true, data: tx });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update transaction' });
  }
});

router.delete('/:id', authorize(['ADMIN', 'EDITOR']), async (req: Request, res: Response) => {
  try {
    const existing = await prisma.transaction.findUnique({ where: { id: Number(req.params.id) } });
    if (!existing) return res.status(404).json({ success: false, message: 'Not found' });
    if (existing.isLocked) return res.status(403).json({ success: false, message: 'Transaction is locked' });

    await prisma.transaction.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to delete' });
  }
});

router.post('/upload', authorize(['ADMIN', 'EDITOR']), upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file' });
  const type = req.body.type as TransactionType;
  if (!type) return res.status(400).json({ success: false, message: 'Type required' });

  try {
    const isQuyetToan = type === TransactionType.QUYET_TOAN;
    const headers = isQuyetToan 
      ? ['Ngày', 'Mã đối tác', 'Loại giao dịch', 'Số lượng', 'Số tiền', 'Connector', 'Mã giao dịch']
      : ['Ngày', 'Mã đối tác', 'Loại giao dịch', 'Số lượng', 'Số tiền', 'Connector', 'Mã giao dịch', 'Tên ngân hàng'];
    
    const rows = excelService.parseExcel(req.file.buffer);
    const data = excelService.rowsToObjects(rows, headers);

    const connectors = await prisma.connector.findMany({ where: { isActive: true } });
    const partners = await prisma.partner.findMany();
    const activeConnectorCodes = new Set(connectors.map(c => c.connectorCode));
    const partnerCodes = new Set(partners.map(p => p.partnerCode));

    let successCount = 0;
    let failedCount = 0;

    for (const item of data) {
      const dateStr = item['Ngày'];
      const pCode = String(item['Mã đối tác']);
      const cCode = String(item['Connector']);

      if (!dateStr || !pCode || !cCode || !activeConnectorCodes.has(cCode) || !partnerCodes.has(pCode)) {
        failedCount++;
        continue;
      }

      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        failedCount++;
        continue;
      }

      // Check lock
      const locked = await prisma.transaction.findFirst({
        where: { date, connectorCode: cCode, isLocked: true }
      });
      if (locked) {
        failedCount++;
        continue;
      }

      try {
        await prisma.transaction.create({
          data: {
            date,
            partnerCode: pCode,
            type,
            transactionType: item['Loại giao dịch'] ? String(item['Loại giao dịch']) : null,
            quantity: Number(item['Số lượng']) || 0,
            amount: Number(item['Số tiền']) || 0,
            connectorCode: cCode,
            transactionCode: item['Mã giao dịch'] ? String(item['Mã giao dịch']) : null,
            bankName: item['Tên ngân hàng'] ? String(item['Tên ngân hàng']) : null,
          }
        });
        successCount++;
      } catch (e) {
        failedCount++;
      }
    }
    res.json({ success: true, successCount, failedCount });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

export default router;
