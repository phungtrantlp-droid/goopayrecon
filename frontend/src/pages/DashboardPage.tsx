import React, { useState, useEffect } from 'react';
import { LayoutDashboard, TrendingUp, TrendingDown, FileCheck, DollarSign, Download, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getDashboardSummary, exportDashboard } from '../api/dashboard';
import { getConnectors } from '../api/connectors';
import { DashboardSummary, Connector } from '../types';
import { useAuthStore } from '../store/authStore';
import { Select, Button, Badge } from '../components/ui';
import { formatCurrency } from '../utils/formatters';

export const DashboardPage: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState<number | ''>(new Date().getMonth() + 1);
  const [connectorCode, setConnectorCode] = useState('');
  
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { canExport } = useAuthStore();

  useEffect(() => {
    getConnectors().then(setConnectors).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const res = await getDashboardSummary({ year, month: month || undefined, connectorCode: connectorCode || undefined });
        setData(res);
      } catch (e) {
        toast.error('Lỗi khi tải báo cáo');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [year, month, connectorCode]);

  const handleExport = async () => {
    try {
      const blob = await exportDashboard({ year, month: month || undefined, connectorCode: connectorCode || undefined });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `baocao_${year}${month ? `_${month}` : ''}.xlsx`;
      a.click();
    } catch (e) {
      toast.error('Lỗi xuất báo cáo');
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => ({ label: `${currentYear - i}`, value: currentYear - i }));
  const months = Array.from({ length: 12 }, (_, i) => ({ label: `Tháng ${i + 1}`, value: i + 1 }));

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-white">
          <div className="p-2 bg-primary/20 rounded-lg"><LayoutDashboard className="w-6 h-6 text-primary" /></div>
          <h1 className="text-2xl font-bold">Dashboard & Báo Cáo</h1>
        </div>
        {canExport() && (
          <Button leftIcon={<Download className="w-4 h-4" />} onClick={handleExport}>Xuất Excel</Button>
        )}
      </div>

      <div className="glass-card p-4 rounded-lg flex items-center gap-4">
        <div className="flex items-center gap-2 text-gray-400">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">Thời gian:</span>
        </div>
        <div className="w-32"><Select options={years} value={year} onChange={(e) => setYear(Number(e.target.value))} /></div>
        <div className="w-32"><Select options={months} value={month} onChange={(e) => setMonth(e.target.value ? Number(e.target.value) : '')} /></div>
        <div className="w-48"><Select options={connectors.map(c => ({ label: c.connectorName, value: c.connectorCode }))} value={connectorCode} onChange={(e) => setConnectorCode(e.target.value)} /></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-xl border-t-4 border-t-green-500 hover:-translate-y-1 transition-transform">
          <div className="flex items-center gap-3 text-gray-400 mb-2">
            <div className="p-2 rounded bg-green-500/10"><TrendingUp className="w-5 h-5 text-green-400" /></div>
            <span className="font-medium">Tổng THU</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {loading ? <div className="h-9 w-32 bg-white/10 rounded animate-pulse" /> : formatCurrency(data?.totalThu || 0)}
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl border-t-4 border-t-red-500 hover:-translate-y-1 transition-transform">
          <div className="flex items-center gap-3 text-gray-400 mb-2">
            <div className="p-2 rounded bg-red-500/10"><TrendingDown className="w-5 h-5 text-red-400" /></div>
            <span className="font-medium">Tổng CHI</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {loading ? <div className="h-9 w-32 bg-white/10 rounded animate-pulse" /> : formatCurrency(data?.totalChi || 0)}
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl border-t-4 border-t-purple-500 hover:-translate-y-1 transition-transform">
          <div className="flex items-center gap-3 text-gray-400 mb-2">
            <div className="p-2 rounded bg-purple-500/10"><FileCheck className="w-5 h-5 text-purple-400" /></div>
            <span className="font-medium">Tổng Quyết Toán</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {loading ? <div className="h-9 w-32 bg-white/10 rounded animate-pulse" /> : formatCurrency(data?.totalQuyetToan || 0)}
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl border-t-4 border-t-blue-500 hover:-translate-y-1 transition-transform">
          <div className="flex items-center gap-3 text-gray-400 mb-2">
            <div className="p-2 rounded bg-blue-500/10"><DollarSign className="w-5 h-5 text-blue-400" /></div>
            <span className="font-medium">Phải Trả</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {loading ? <div className="h-9 w-32 bg-white/10 rounded animate-pulse" /> : formatCurrency(data?.netPayable || 0)}
          </div>
        </div>
      </div>

      <div className="glass-card rounded-lg overflow-hidden border border-border-color">
        <div className="p-4 border-b border-border-color bg-surface-card">
          <h3 className="font-semibold text-white">Báo cáo chi tiết Đối Tác</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-card border-b border-border-color text-gray-300">
              <tr>
                <th className="px-4 py-3">Đối Tác</th>
                <th className="px-4 py-3">Tên</th>
                <th className="px-4 py-3">Trạng Thái Khóa</th>
                <th className="px-4 py-3 text-right">THU</th>
                <th className="px-4 py-3 text-right">CHI</th>
                <th className="px-4 py-3 text-right">Quyết Toán</th>
                <th className="px-4 py-3 text-right">Phải Trả</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center"><div className="h-4 w-32 bg-white/10 rounded mx-auto animate-pulse" /></td></tr>
              ) : data?.partnerSummaries.map((p, i) => (
                <tr key={i} className={`border-b border-border-color hover:bg-white/5 ${p.isUnlocked ? 'bg-yellow-500/5' : ''}`}>
                  <td className="px-4 py-3 font-medium text-white">{p.partnerCode}</td>
                  <td className="px-4 py-3">{p.partnerName}</td>
                  <td className="px-4 py-3">
                    {p.isUnlocked ? <Badge variant="orange" showDot>CHƯA KHÓA</Badge> : <Badge variant="green" showDot>ĐÃ KHÓA</Badge>}
                  </td>
                  <td className="px-4 py-3 text-right text-green-400">{formatCurrency(p.thu)}</td>
                  <td className="px-4 py-3 text-right text-red-400">{formatCurrency(p.chi)}</td>
                  <td className="px-4 py-3 text-right text-purple-400">{formatCurrency(p.quyetToan)}</td>
                  <td className="px-4 py-3 text-right text-blue-400 font-bold">{formatCurrency(p.payable)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
