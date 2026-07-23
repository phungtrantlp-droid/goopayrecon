import { TransactionType } from '@prisma/client';

export interface CumulativeResult {
  date: string;
  partnerCode: string;
  partnerName: string;
  parentPartnerCode: string | null;
  openingBalance: number;
  thu: number;
  chi: number;
  quyetToan: number;
  closingBalance: number;
}

export const balanceService = {
  calculateOpeningBalance(transactions: any[], beforeDate: Date): number {
    return transactions
      .filter((t) => new Date(t.date).getTime() < beforeDate.getTime())
      .reduce((acc, t) => {
        const amount = Number(t.amount);
        if (t.type === TransactionType.THU) return acc + amount;
        if (t.type === TransactionType.CHI || t.type === TransactionType.QUYET_TOAN) return acc - amount;
        return acc;
      }, 0);
  },

  calculatePayable(thu: number, chi: number, quyetToan: number): number {
    return thu - chi - quyetToan;
  },

  calculateCumulative(allTransactions: any[], dateFrom: Date, dateTo: Date, filterPartnerCode?: string): CumulativeResult[] {
    // Group transactions by partner
    const partnersMap = new Map<string, { partnerName: string; parentCode: string | null; transactions: any[] }>();
    
    allTransactions.forEach((t) => {
      if (!partnersMap.has(t.partnerCode)) {
        partnersMap.set(t.partnerCode, {
          partnerName: t.partner?.partnerName || 'Unknown',
          parentCode: t.partner?.parentId || null,
          transactions: [],
        });
      }
      partnersMap.get(t.partnerCode)!.transactions.push(t);
    });

    const results: CumulativeResult[] = [];
    const dateRange: string[] = [];
    const fromTime = dateFrom.getTime();
    const toTime = dateTo.getTime();

    for (let d = fromTime; d <= toTime; d += 86400000) {
      dateRange.push(new Date(d).toISOString().split('T')[0]);
    }

    for (const [partnerCode, data] of partnersMap.entries()) {
      if (filterPartnerCode && partnerCode !== filterPartnerCode) continue;

      let currentBalance = this.calculateOpeningBalance(data.transactions, dateFrom);

      for (const dateStr of dateRange) {
        const dailyTxs = data.transactions.filter((t) => new Date(t.date).toISOString().split('T')[0] === dateStr);
        
        let thu = 0;
        let chi = 0;
        let quyetToan = 0;

        dailyTxs.forEach((t) => {
          const amt = Number(t.amount);
          if (t.type === TransactionType.THU) thu += amt;
          if (t.type === TransactionType.CHI) chi += amt;
          if (t.type === TransactionType.QUYET_TOAN) quyetToan += amt;
        });

        if (thu > 0 || chi > 0 || quyetToan > 0 || currentBalance !== 0) {
          const opening = currentBalance;
          currentBalance = currentBalance + thu - chi - quyetToan;

          results.push({
            date: dateStr,
            partnerCode,
            partnerName: data.partnerName,
            parentPartnerCode: data.parentCode,
            openingBalance: opening,
            thu,
            chi,
            quyetToan,
            closingBalance: currentBalance,
          });
        }
      }
    }

    return results.sort((a, b) => a.date.localeCompare(b.date) || a.partnerCode.localeCompare(b.partnerCode));
  }
};
