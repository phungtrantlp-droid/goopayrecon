import React, { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getBalance } from '../api/balance';
import { getPartners } from '../api/partners';
import { getConnectors } from '../api/connectors';
import { CumulativeBalance, FilterState, Partner, Connector } from '../types';
import { DataBoard } from '../components/DataBoard/DataBoard';
import { ColumnFilter } from '../components/DataBoard/ColumnFilter';
import { formatDate, formatCurrency, toISODate } from '../utils/formatters';

export const BalancePage: React.FC = () => {
  const [data, setData] = useState<CumulativeBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'detailed'>('summary');
  const [filters, setFilters] = useState<FilterState>({ fromDate: toISODate(new Date()), toDate: toISODate(new Date()) });
  const [partners, setPartners] = useState<Partner[]>([]);
  const [connectors, setConnectors] = useState<Connector[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getBalance(filters);
      setData(res);
    } catch (e) {
      toast.error('Lỗi khi tải dữ liệu số dư');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPartners().then(setPartners).catch(console.error);
    getConnectors().then(setConnectors).catch(console.error);
  }, []);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const groupedData = React.useMemo(() => {
    const map = new Map<string, CumulativeBalance>();
    
    data.forEach(row => {
      if (!map.has(row.partnerCode)) {
        map.set(row.partnerCode, { ...row, thu: 0, chi: 0, quyetToan: 0 });
      }
      const p = map.get(row.partnerCode)!;
      p.thu += row.thu;
      p.chi += row.chi;
      p.quyetToan += row.quyetToan;
      p.closingBalance = row.closingBalance;
    });
    
    return Array.from(map.values());
  }, [data]);

  const detailedColumns = [
    {
      id: 'date',
      header: 'Ngày',
      accessorKey: 'date',
      cell: (info: any) => formatDate(info.getValue()),
      size: 100,
    },
    {
      id: 'parentCode',
      header: 'Mã ĐT Cha',
      accessorFn: (row: any) => row.partner?.parent?.partnerCode || '',
      size: 100,
    },
    {
      id: 'partnerCode',
      header: 'Mã Đối Tác',
      accessorKey: 'partnerCode',
      size: 100,
    },
    {
      id: 'partnerName',
      header: 'Tên Đối Tác',
      accessorFn: (row: any) => row.partner?.partnerName || '',
      size: 150,
    },
    {
      id: 'openingBalance',
      header: 'Số dư đầu kỳ',
      accessorKey: 'openingBalance',
      cell: (info: any) => <div className="text-right text-blue-400 font-medium">{formatCurrency(info.getValue())}</div>,
      size: 130,
    },
    {
      id: 'thu',
      header: 'THU',
      accessorKey: 'thu',
      cell: (info: any) => <div className="text-right text-green-400">{formatCurrency(info.getValue())}</div>,
      size: 120,
    },
    {
      id: 'chi',
      header: 'CHI',
      accessorKey: 'chi',
      cell: (info: any) => <div className="text-right text-red-400">{formatCurrency(info.getValue())}</div>,
      size: 120,
    },
    {
      id: 'quyetToan',
      header: 'Quyết Toán',
      accessorKey: 'quyetToan',
      cell: (info: any) => <div className="text-right text-purple-400">{formatCurrency(info.getValue())}</div>,
      size: 120,
    },
    {
      id: 'closingBalance',
      header: 'Số dư cuối kỳ',
      accessorKey: 'closingBalance',
      cell: (info: any) => {
        const val = info.getValue();
        return <div className={`text-right font-bold ${val >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(val)}</div>;
      },
      size: 140,
    },
  ];

  const summaryColumns = detailedColumns.filter(c => c.id !== 'date');

  const displayData = activeTab === 'summary' ? groupedData : data;
  const displayColumns = activeTab === 'summary' ? summaryColumns : detailedColumns;

  const totalOpening = displayData.reduce((sum, row) => sum + row.openingBalance, 0);
  const totalClosing = displayData.reduce((sum, row) => sum + row.closingBalance, 0);

  return (
    <div className="flex flex-col gap-4 animate-fade-in h-[calc(100vh-100px)]">
      <div className="flex items-center gap-3 text-white shrink-0">
        <div className="p-2 bg-blue-500/20 rounded-lg"><BarChart3 className="w-6 h-6 text-blue-400" /></div>
        <h1 className="text-2xl font-bold">Số Dư Lũy Kế</h1>
      </div>

      <div className="flex gap-4 border-b border-border-color shrink-0">
        <button onClick={() => setActiveTab('summary')} className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === 'summary' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}>
          Số Dư Lũy Kế
        </button>
        <button onClick={() => setActiveTab('detailed')} className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === 'detailed' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}>
          Số Dư Chi Tiết
        </button>
      </div>

      <ColumnFilter filters={filters} onChange={setFilters} partners={partners} connectors={connectors} />

      <div className="flex-1 min-h-0">
        <DataBoard data={displayData} columns={displayColumns} isLoading={loading} />
      </div>

      <div className="shrink-0 glass-card p-4 rounded-lg flex justify-between items-center text-sm font-medium">
        <div className="text-gray-400">Tổng số {activeTab === 'summary' ? 'đối tác' : 'dòng'}: <span className="text-white ml-1">{displayData.length}</span></div>
        <div className="flex gap-8">
          <div className="text-gray-400">Tổng SD Đầu kỳ: <span className="text-blue-400 ml-1 text-lg">{formatCurrency(totalOpening)}</span></div>
          <div className="text-gray-400">Tổng SD Cuối kỳ: <span className={`${totalClosing >= 0 ? 'text-green-500' : 'text-red-500'} ml-1 text-lg`}>{formatCurrency(totalClosing)}</span></div>
        </div>
      </div>
    </div>
  );
};
