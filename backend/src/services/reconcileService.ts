import { TransactionType } from '@prisma/client';

export interface GroupedRecord {
  date: string;
  connectorCode: string;
  systemQtyThu: number;
  systemAmountThu: number;
  systemQtyChi: number;
  systemAmountChi: number;
  systemQtyQuyetToan: number;
  systemAmountQuyetToan: number;
  isLocked: boolean;
}

export const reconcileService = {
  groupByDateConnector(transactions: any[]): GroupedRecord[] {
    const groups = new Map<string, GroupedRecord>();

    transactions.forEach((t) => {
      const dateStr = new Date(t.date).toISOString().split('T')[0];
      const key = `${dateStr}_${t.connectorCode}`;
      
      if (!groups.has(key)) {
        groups.set(key, {
          date: dateStr,
          connectorCode: t.connectorCode,
          systemQtyThu: 0,
          systemAmountThu: 0,
          systemQtyChi: 0,
          systemAmountChi: 0,
          systemQtyQuyetToan: 0,
          systemAmountQuyetToan: 0,
          isLocked: t.isLocked,
        });
      }

      const g = groups.get(key)!;
      const amount = Number(t.amount);
      const qty = t.quantity || 0;

      if (t.type === TransactionType.THU) {
        g.systemQtyThu += qty;
        g.systemAmountThu += amount;
      } else if (t.type === TransactionType.CHI) {
        g.systemQtyChi += qty;
        g.systemAmountChi += amount;
      } else if (t.type === TransactionType.QUYET_TOAN) {
        g.systemQtyQuyetToan += qty;
        g.systemAmountQuyetToan += amount;
      }
      
      if (t.isLocked) {
        g.isLocked = true;
      }
    });

    return Array.from(groups.values()).sort((a, b) => b.date.localeCompare(a.date));
  },

  calculateDiff(system: number, actual: number): { diff: number; diffPercent: number } {
    const diff = actual - system;
    const diffPercent = system === 0 ? (actual === 0 ? 0 : 100) : (diff / system) * 100;
    return { diff, diffPercent: Number(diffPercent.toFixed(2)) };
  }
};
