import React, { useState, useEffect } from 'react';
import { RefreshCw, Lock, Unlock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getReconciliation, lockPeriod, unlockPeriod, updateActual } from '../api/reconciliation';
import { getConnectors } from '../api/connectors';
import { ReconciliationGroup, FilterState, Connector } from '../types';
import { useAuthStore } from '../store/authStore';
import { Button, Modal, Input, Badge } from '../components/ui';
import { ColumnFilter } from '../components/DataBoard/ColumnFilter';
import { formatDate, formatCurrency, formatNumber, toISODate } from '../utils/formatters';

export const ReconciliationPage: React.FC = () => {
  const [data, setData] = useState<ReconciliationGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ fromDate: toISODate(new Date()), toDate: toISODate(new Date()) });
  const [connectors, setConnectors] = useState<Connector[]>([]);
  
  const [adminPassword, setAdminPassword] = useState('');
  const [isUnlockOpen, setIsUnlockOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<ReconciliationGroup | null>(null);

  const { canEdit, isAdmin } = useAuthStore();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getReconciliation(filters);
      setData(res);
    } catch (e) {
      toast.error('Lỗi khi tải dữ liệu đối soát');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getConnectors().then(setConnectors).catch(console.error);
  }, []);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleActualChange = async (row: ReconciliationGroup, field: string, val: string) => {
    const num = Number(val);
    if (isNaN(num)) return;
    try {
      await updateActual({
        date: row.date,
        connectorCode: row.connectorCode,
        [field]: num
      });
      fetchData();
    } catch (e) {
      toast.error('Lỗi cập nhật số liệu thực tế');
    }
  };

  const handleLock = async (row: ReconciliationGroup) => {
    if (!confirm('Khóa sổ sẽ không cho phép sửa đổi dữ liệu trong ngày này. Bạn chắc chắn?')) return;
    try {
      await lockPeriod(row.date, row.connectorCode);
      toast.success('Khóa sổ thành công');
      fetchData();
    } catch (e) {
      toast.error('Lỗi khóa sổ');
    }
  };

  const handleUnlock = async () => {
    if (!selectedRow || !adminPassword) return;
    try {
      await unlockPeriod(selectedRow.date, selectedRow.connectorCode, adminPassword);
      toast.success('Mở khóa thành công');
      setIsUnlockOpen(false);
      setAdminPassword('');
      fetchData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Sai mật khẩu Admin');
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-in h-[calc(100vh-100px)]">
      <div className="flex items-center gap-3 text-white shrink-0">
        <div className="p-2 bg-yellow-500/20 rounded-lg"><RefreshCw className="w-6 h-6 text-yellow-500" /></div>
        <h1 className="text-2xl font-bold">Đối Soát & Khóa Sổ</h1>
      </div>

      <ColumnFilter filters={filters} onChange={setFilters} connectors={connectors} />

      <div className="flex-1 min-h-0 glass-card rounded-lg overflow-hidden border border-border-color">
        <div className="overflow-auto h-full relative">
          <table className="w-full text-sm text-left table-fixed">
            <thead className="sticky top-0 z-10 bg-surface">
              <tr>
                <th className="px-4 py-3 border-b border-border-color w-24">Ngày</th>
                <th className="px-4 py-3 border-b border-border-color w-32">Connector</th>
                <th className="px-4 py-3 border-b border-border-color text-center bg-green-500/5" colSpan={3}>THU (Hệ thống)</th>
                <th className="px-4 py-3 border-b border-border-color text-center bg-green-500/10" colSpan={2}>THU (Thực tế)</th>
                <th className="px-4 py-3 border-b border-border-color text-center bg-green-500/20" colSpan={2}>Chênh lệch THU</th>
                <th className="px-4 py-3 border-b border-border-color text-center bg-red-500/5" colSpan={3}>CHI (Hệ thống)</th>
                <th className="px-4 py-3 border-b border-border-color text-center bg-red-500/10" colSpan={2}>CHI (Thực tế)</th>
                <th className="px-4 py-3 border-b border-border-color text-center bg-red-500/20" colSpan={2}>Chênh lệch CHI</th>
                <th className="px-4 py-3 border-b border-border-color w-24">Trạng thái</th>
                {canEdit() && <th className="px-4 py-3 border-b border-border-color w-28 text-center">Hành động</th>}
              </tr>
              <tr className="text-xs text-gray-400">
                <th className="border-b border-border-color"></th>
                <th className="border-b border-border-color"></th>
                <th className="px-2 py-2 border-b border-border-color bg-green-500/5 text-right">SL</th>
                <th className="px-2 py-2 border-b border-border-color bg-green-500/5 text-right w-28">Số Tiền</th>
                <th className="border-b border-border-color bg-green-500/5"></th>
                <th className="px-2 py-2 border-b border-border-color bg-green-500/10 w-20 text-right">SL TT</th>
                <th className="px-2 py-2 border-b border-border-color bg-green-500/10 w-28 text-right">Số Tiền TT</th>
                <th className="px-2 py-2 border-b border-border-color bg-green-500/20 text-right">CL SL</th>
                <th className="px-2 py-2 border-b border-border-color bg-green-500/20 text-right w-28">CL TT</th>
                
                <th className="px-2 py-2 border-b border-border-color bg-red-500/5 text-right">SL</th>
                <th className="px-2 py-2 border-b border-border-color bg-red-500/5 text-right w-28">Số Tiền</th>
                <th className="border-b border-border-color bg-red-500/5"></th>
                <th className="px-2 py-2 border-b border-border-color bg-red-500/10 w-20 text-right">SL TT</th>
                <th className="px-2 py-2 border-b border-border-color bg-red-500/10 w-28 text-right">Số Tiền TT</th>
                <th className="px-2 py-2 border-b border-border-color bg-red-500/20 text-right">CL SL</th>
                <th className="px-2 py-2 border-b border-border-color bg-red-500/20 text-right w-28">CL TT</th>
                <th className="border-b border-border-color"></th>
                {canEdit() && <th className="border-b border-border-color"></th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={20} className="p-8 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : data.map((row) => {
                const diffThuQty = row.actualThuQuantity - row.systemThuQuantity;
                const diffThuAmt = row.actualThuAmount - row.systemThuAmount;
                const diffChiQty = row.actualChiQuantity - row.systemChiQuantity;
                const diffChiAmt = row.actualChiAmount - row.systemChiAmount;
                
                return (
                  <tr key={row.id} className={`border-b border-border-color hover:bg-white/5 ${row.isLocked ? 'opacity-70 bg-surface-card/50' : ''}`}>
                    <td className="px-4 py-2">{formatDate(row.date)}</td>
                    <td className="px-4 py-2 font-medium">{row.connectorCode}</td>
                    
                    <td className="px-2 py-2 text-right bg-green-500/5">{formatNumber(row.systemThuQuantity)}</td>
                    <td className="px-2 py-2 text-right bg-green-500/5 text-green-400">{formatCurrency(row.systemThuAmount)}</td>
                    <td className="bg-green-500/5"></td>
                    <td className="px-2 py-2 bg-green-500/10">
                      <input type="number" className="w-full bg-[#0d1117] border border-border-color rounded px-1 py-1 text-right text-xs" value={row.actualThuQuantity || ''} onChange={(e) => handleActualChange(row, 'actualThuQuantity', e.target.value)} disabled={row.isLocked || !canEdit()} />
                    </td>
                    <td className="px-2 py-2 bg-green-500/10">
                      <input type="number" className="w-full bg-[#0d1117] border border-border-color rounded px-1 py-1 text-right text-xs" value={row.actualThuAmount || ''} onChange={(e) => handleActualChange(row, 'actualThuAmount', e.target.value)} disabled={row.isLocked || !canEdit()} />
                    </td>
                    <td className={`px-2 py-2 text-right bg-green-500/20 font-bold ${diffThuQty === 0 ? 'text-green-500' : 'text-red-500'}`}>{diffThuQty > 0 ? '+' : ''}{diffThuQty}</td>
                    <td className={`px-2 py-2 text-right bg-green-500/20 font-bold ${diffThuAmt === 0 ? 'text-green-500' : 'text-red-500'}`}>{diffThuAmt > 0 ? '+' : ''}{formatCurrency(diffThuAmt)}</td>

                    <td className="px-2 py-2 text-right bg-red-500/5">{formatNumber(row.systemChiQuantity)}</td>
                    <td className="px-2 py-2 text-right bg-red-500/5 text-red-400">{formatCurrency(row.systemChiAmount)}</td>
                    <td className="bg-red-500/5"></td>
                    <td className="px-2 py-2 bg-red-500/10">
                      <input type="number" className="w-full bg-[#0d1117] border border-border-color rounded px-1 py-1 text-right text-xs" value={row.actualChiQuantity || ''} onChange={(e) => handleActualChange(row, 'actualChiQuantity', e.target.value)} disabled={row.isLocked || !canEdit()} />
                    </td>
                    <td className="px-2 py-2 bg-red-500/10">
                      <input type="number" className="w-full bg-[#0d1117] border border-border-color rounded px-1 py-1 text-right text-xs" value={row.actualChiAmount || ''} onChange={(e) => handleActualChange(row, 'actualChiAmount', e.target.value)} disabled={row.isLocked || !canEdit()} />
                    </td>
                    <td className={`px-2 py-2 text-right bg-red-500/20 font-bold ${diffChiQty === 0 ? 'text-green-500' : 'text-red-500'}`}>{diffChiQty > 0 ? '+' : ''}{diffChiQty}</td>
                    <td className={`px-2 py-2 text-right bg-red-500/20 font-bold ${diffChiAmt === 0 ? 'text-green-500' : 'text-red-500'}`}>{diffChiAmt > 0 ? '+' : ''}{formatCurrency(diffChiAmt)}</td>

                    <td className="px-4 py-2">
                      {row.isLocked ? <Badge variant="red" showDot>Đã khóa</Badge> : <Badge variant="green" showDot>Chưa khóa</Badge>}
                    </td>
                    {canEdit() && (
                      <td className="px-4 py-2 text-center">
                        {!row.isLocked ? (
                          <Button size="sm" variant="secondary" leftIcon={<Lock className="w-3 h-3 text-yellow-500" />} onClick={() => handleLock(row)}>Khóa</Button>
                        ) : isAdmin() ? (
                          <Button size="sm" variant="danger" leftIcon={<Unlock className="w-3 h-3" />} onClick={() => { setSelectedRow(row); setIsUnlockOpen(true); }}>Mở</Button>
                        ) : null}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isUnlockOpen} onClose={() => setIsUnlockOpen(false)} title="Xác nhận mở khóa" size="sm"
        footer={<><Button variant="ghost" onClick={() => setIsUnlockOpen(false)}>Hủy</Button><Button variant="danger" onClick={handleUnlock}>Mở khóa</Button></>}>
        <div className="text-gray-300 mb-4 text-sm">
          Bạn đang yêu cầu mở khóa dữ liệu ngày <span className="font-bold text-white">{selectedRow ? formatDate(selectedRow.date) : ''}</span>. Vui lòng nhập mật khẩu Admin.
        </div>
        <Input type="password" label="Mật khẩu Admin" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
      </Modal>
    </div>
  );
};
