import { Router, Request, Response } from 'express';
import { PrismaClient, TransactionType } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import { excelService } from '../services/excelService';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/summary', async (req: Request, res: Response) => {
  try {
    const { year, month, connectorCode } = req.query;
    
    if (!year || !month) {
      return res.status(400).json({ success: false, message: 'Year and month required' });
    }

    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0);

    let where: any = {
      date: { gte: startDate, lte: endDate }
    };
    if (connectorCode) where.connectorCode = connectorCode;

    const transactions = await prisma.transaction.findMany({
      where,
      include: { partner: true }
    });

    const partnerMap = new Map<string, any>();
    let totalThu = 0, totalChi = 0, totalQuyetToan = 0;
    
    transactions.forEach(t => {
      const pCode = t.partnerCode;
      if (!partnerMap.has(pCode)) {
        partnerMap.set(pCode, {
          partnerCode: pCode,
          partnerName: t.partner?.partnerName,
          thu: 0,
          chi: 0,
          quyetToan: 0,
          hasUnlocked: false
        });
      }
      const p = partnerMap.get(pCode)!;
      const amt = Number(t.amount);
      if (t.type === TransactionType.THU) { p.thu += amt; totalThu += amt; }
      else if (t.type === TransactionType.CHI) { p.chi += amt; totalChi += amt; }
      else if (t.type === TransactionType.QUYET_TOAN) { p.quyetToan += amt; totalQuyetToan += amt; }
      
      if (!t.isLocked) p.hasUnlocked = true;
    });

    const partnerSummaries = Array.from(partnerMap.values())
      .map(p => ({ ...p, isUnlocked: p.hasUnlocked, payable: p.thu - p.chi - p.quyetToan }))
      .sort((a, b) => {
        if (a.isUnlocked && !b.isUnlocked) return -1;
        if (!a.isUnlocked && b.isUnlocked) return 1;
        return a.partnerCode.localeCompare(b.partnerCode);
      });

    res.json({
      success: true,
      data: {
        month: `${year}-${String(month).padStart(2, '0')}`,
        totalThu,
        totalChi,
        totalQuyetToan,
        netPayable: totalThu - totalChi - totalQuyetToan,
        partnerSummaries
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch summary' });
  }
});

router.get('/export', authorize(['ADMIN', 'EDITOR']), async (req: Request, res: Response) => {
  try {
    const { year, month, connectorCode } = req.query;
    if (!year || !month) {
      return res.status(400).json({ success: false, message: 'Year and month required' });
    }

    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0);
    let where: any = { date: { gte: startDate, lte: endDate } };
    if (connectorCode) where.connectorCode = connectorCode;

    const txs = await prisma.transaction.findMany({
      where,
      include: { partner: true, connector: true },
      orderBy: { date: 'asc' }
    });

    const thuData: any[] = [];
    const chiData: any[] = [];
    const quyetToanData: any[] = [];
    
    let totalThu = 0;
    let totalChi = 0;
    let totalQuyetToan = 0;

    txs.forEach(t => {
      const dateStr = new Date(t.date).toISOString().split('T')[0];
      const amt = Number(t.amount);
      const row = [
        dateStr,
        t.partnerCode,
        t.partner.partnerName,
        t.transactionType || '',
        t.quantity,
        amt,
        t.connectorCode,
        t.transactionCode || '',
        t.bankName || ''
      ];
      if (t.type === TransactionType.THU) {
        thuData.push(row);
        totalThu += amt;
      }
      else if (t.type === TransactionType.CHI) {
        chiData.push(row);
        totalChi += amt;
      }
      else if (t.type === TransactionType.QUYET_TOAN) {
        quyetToanData.push([dateStr, t.partnerCode, t.partner.partnerName, t.transactionType || '', t.quantity, amt, t.connectorCode, t.transactionCode || '']);
        totalQuyetToan += amt;
      }
    });

    const summaryData = [
      ['Tổng Thu', totalThu],
      ['Tổng Chi', totalChi],
      ['Tổng Quyết Toán', totalQuyetToan],
      ['Số lượng GD Thu', thuData.length],
      ['Số lượng GD Chi', chiData.length],
      ['Số lượng GD Quyết Toán', quyetToanData.length],
    ];

    const sheets = [
      { name: 'Summary', headers: ['Chỉ tiêu', 'Giá trị'], data: summaryData },
      { name: 'THU', headers: ['Ngày', 'Mã ĐT', 'Tên ĐT', 'Loại GD', 'Số lượng', 'Số tiền', 'Connector', 'Mã GD', 'Ngân hàng'], data: thuData },
      { name: 'CHI', headers: ['Ngày', 'Mã ĐT', 'Tên ĐT', 'Loại GD', 'Số lượng', 'Số tiền', 'Connector', 'Mã GD', 'Ngân hàng'], data: chiData },
      { name: 'QUYET_TOAN', headers: ['Ngày', 'Mã ĐT', 'Tên ĐT', 'Loại GD', 'Số lượng', 'Số tiền', 'Connector', 'Mã GD'], data: quyetToanData },
    ];

    const buffer = excelService.generateExport(sheets);
    res.setHeader('Content-Disposition', `attachment; filename="export_${year}_${month}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Export failed' });
  }
});

export default router;
