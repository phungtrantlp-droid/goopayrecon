import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import multer from 'multer';
import { excelService } from '../services/excelService';

const router = Router();
const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);

router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, isActive, serviceType, tree } = req.query;
    
    let where: any = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (serviceType) where.serviceType = serviceType;
    if (search) {
      where.OR = [
        { partnerCode: { contains: String(search), mode: 'insensitive' } },
        { partnerName: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    if (tree === 'true') {
      where.parentId = null;
      const parents = await prisma.partner.findMany({
        where,
        include: { children: true },
        orderBy: { partnerCode: 'asc' }
      });
      return res.json({ success: true, data: parents });
    }

    const partners = await prisma.partner.findMany({
      where,
      orderBy: { partnerCode: 'asc' }
    });
    res.json({ success: true, data: partners });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch partners' });
  }
});

router.get('/template/download', (req: Request, res: Response) => {
  const headers = ['Mã đối tác', 'Tên đối tác', 'Mã đối tác cha', 'Email', 'Loại dịch vụ', 'Ghi chú', 'Tên tài khoản', 'Số tài khoản', 'Tên ngân hàng'];
  const buffer = excelService.generateTemplate(headers, 'Partners');
  res.setHeader('Content-Disposition', 'attachment; filename="partner_template.xlsx"');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
});

router.get('/:code', async (req: Request, res: Response) => {
  try {
    const partner = await prisma.partner.findUnique({
      where: { partnerCode: req.params.code },
      include: { children: true, parent: true }
    });
    if (!partner) return res.status(404).json({ success: false, message: 'Partner not found' });
    res.json({ success: true, data: partner });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch partner' });
  }
});

router.post('/', authorize(['ADMIN', 'EDITOR']), async (req: Request, res: Response) => {
  try {
    const partner = await prisma.partner.create({ data: req.body });
    res.status(201).json({ success: true, data: partner });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to create partner' });
  }
});

router.put('/:code', authorize(['ADMIN', 'EDITOR']), async (req: Request, res: Response) => {
  try {
    const partner = await prisma.partner.update({
      where: { partnerCode: req.params.code },
      data: req.body
    });
    res.json({ success: true, data: partner });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Failed to update partner' });
  }
});

router.delete('/:code', authorize(['ADMIN', 'EDITOR']), async (req: Request, res: Response) => {
  try {
    await prisma.partner.update({
      where: { partnerCode: req.params.code },
      data: { isActive: false }
    });
    res.json({ success: true, message: 'Partner deactivated' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to delete partner' });
  }
});

router.post('/upload', authorize(['ADMIN', 'EDITOR']), upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

  try {
    const rows = excelService.parseExcel(req.file.buffer);
    const headers = ['Mã đối tác', 'Tên đối tác', 'Mã đối tác cha', 'Email', 'Loại dịch vụ', 'Ghi chú', 'Tên tài khoản', 'Số tài khoản', 'Tên ngân hàng'];
    const data = excelService.rowsToObjects(rows, headers);

    let successCount = 0;
    let failedCount = 0;

    for (const item of data) {
      if (!item['Mã đối tác'] || !item['Tên đối tác']) {
        failedCount++;
        continue;
      }
      try {
        await prisma.partner.upsert({
          where: { partnerCode: String(item['Mã đối tác']) },
          update: {
            partnerName: String(item['Tên đối tác']),
            parentId: item['Mã đối tác cha'] ? String(item['Mã đối tác cha']) : null,
            email: item['Email'] ? String(item['Email']) : null,
            serviceType: item['Loại dịch vụ'] ? String(item['Loại dịch vụ']) : null,
            notes: item['Ghi chú'] ? String(item['Ghi chú']) : null,
            accountName: item['Tên tài khoản'] ? String(item['Tên tài khoản']) : null,
            accountNumber: item['Số tài khoản'] ? String(item['Số tài khoản']) : null,
            bankName: item['Tên ngân hàng'] ? String(item['Tên ngân hàng']) : null,
          },
          create: {
            partnerCode: String(item['Mã đối tác']),
            partnerName: String(item['Tên đối tác']),
            parentId: item['Mã đối tác cha'] ? String(item['Mã đối tác cha']) : null,
            email: item['Email'] ? String(item['Email']) : null,
            serviceType: item['Loại dịch vụ'] ? String(item['Loại dịch vụ']) : null,
            notes: item['Ghi chú'] ? String(item['Ghi chú']) : null,
            accountName: item['Tên tài khoản'] ? String(item['Tên tài khoản']) : null,
            accountNumber: item['Số tài khoản'] ? String(item['Số tài khoản']) : null,
            bankName: item['Tên ngân hàng'] ? String(item['Tên ngân hàng']) : null,
          }
        });
        successCount++;
      } catch (e) {
        failedCount++;
      }
    }
    res.json({ success: true, total: data.length, successCount, failedCount });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to process file' });
  }
});

export default router;
