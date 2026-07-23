import React, { useState, useEffect } from 'react';
import { TrendingUp, Upload, Download, Edit2, Trash2, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getTransactions, uploadTransactions, downloadTemplate, deleteTransaction, updateTransaction } from '../api/transactions';
import { getPartners } from '../api/partners';
import { getConnectors } from '../api/connectors';
import { Transaction, TransactionType, FilterState, Partner, Connector } from '../types';
import { useAuthStore } from '../store/authStore';
import { Button, Modal, Input } from '../components/ui';
import { DataBoard } from '../components/DataBoard/DataBoard';
import { ColumnFilter } from '../components/DataBoard/ColumnFilter';
import { standardTransactionColumns } from '../utils/columns';
import { formatNumber, formatCurrency, toISODate } from '../utils/formatters';

export const ThuPage: React.FC = () => {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ fromDate: toISODate(new Date()), toDate: toISODate(new Date()) });
  const [partners, setPartners] = useState<Partner[]>([]);
  const [connectors, setConnectors] = useState<Connector[]>([]);
  
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<Transaction | null>(null);
  
  const { canEdit, isAdmin } = useAuthStore();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getTransactions({ ...filters, type: TransactionType.THU });
      setData(res);
    } catch (e) {
      toast.error('Lỗi khi tải dữ liệu');
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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadTransactions(file, TransactionType.THU);
      toast.success(`Upload thành công: ${res.successCount} bản ghi. Lỗi: ${res.failedCount}`);
      setIsUploadOpen(false);
      fetchData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Lỗi khi upload');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) return;
    try {
      await deleteTransaction(id);
      toast.success('Xóa thành công');
      fetchData();
    } catch (e) {
      toast.error('Lỗi khi xóa');
    }
  };

  const handleSaveEdit = async () => {
    if (!editingRow) return;
    try {
      await updateTransaction(editingRow.id, {
        quantity: Number(editingRow.quantity),
        amount: Number(editingRow.amount)
      });
      toast.success('Cập nhật thành công');
      setIsEditOpen(false);
      fetchData();
    } catch (e) {
      toast.error('Lỗi khi cập nhật');
    }
  };

  const columns = [...standardTransactionColumns];
  if (canEdit()) {
    columns.push({
      id: 'actions',
      header: '',
      size: 80,
      enableResizing: false,
      enableSorting: false,
      cell: (info) => {
        const row = info.row.original;
        if (row.isLocked) return <Lock className="w-4 h-4 text-gray-500 mx-auto" />;
        return (
          <div className="flex justify-end gap-2">
            <button onClick={(e) => { e.stopPropagation(); setEditingRow(row); setIsEditOpen(true); }} className="p-1 text-blue-400 hover:bg-blue-400/10 rounded"><Edit2 className="w-4 h-4" /></button>
            {isAdmin() && <button onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }} className="p-1 text-red-400 hover:bg-red-400/10 rounded"><Trash2 className="w-4 h-4" /></button>}
          </div>
        );
      }
    });
  }

  const totalQuantity = data.reduce((acc, row) => acc + row.quantity, 0);
  const totalAmount = data.reduce((acc, row) => acc + row.amount, 0);

  return (
    <div className="flex flex-col gap-4 animate-fade-in h-[calc(100vh-100px)]">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 text-white">
          <div className="p-2 bg-green-500/20 rounded-lg"><TrendingUp className="w-6 h-6 text-green-400" /></div>
          <h1 className="text-2xl font-bold">Phát Sinh Thu</h1>
        </div>
        {canEdit() && (
          <div className="flex gap-3">
            <Button variant="outline" leftIcon={<Download className="w-4 h-4" />} onClick={async () => {
              const blob = await downloadTemplate(TransactionType.THU);
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = 'thu_template.xlsx'; a.click();
            }}>Template</Button>
            <Button variant="secondary" leftIcon={<Upload className="w-4 h-4" />} onClick={() => setIsUploadOpen(true)}>Upload</Button>
          </div>
        )}
      </div>

      <ColumnFilter filters={filters} onChange={setFilters} partners={partners} connectors={connectors} />

      <div className="flex-1 min-h-0">
        <DataBoard data={data} columns={columns} isLoading={loading} getRowClassName={(row) => row.isLocked ? 'opacity-70 bg-surface/50' : ''} />
      </div>

      <div className="shrink-0 glass-card p-4 rounded-lg flex justify-between items-center text-sm font-medium">
        <div className="text-gray-400">Tổng số dòng: <span className="text-white ml-1">{data.length}</span></div>
        <div className="flex gap-8">
          <div className="text-gray-400">Tổng Số Lượng: <span className="text-white ml-1 text-lg">{formatNumber(totalQuantity)}</span></div>
          <div className="text-gray-400">Tổng Số Tiền: <span className="text-green-400 ml-1 text-lg">{formatCurrency(totalAmount)}</span></div>
        </div>
      </div>

      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Upload File Excel - THU" size="md">
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border-color rounded-lg bg-surface hover:border-primary transition-colors">
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-300 mb-2">Kéo thả file hoặc click để chọn</p>
          <input type="file" accept=".xlsx,.xls" onChange={handleUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-white" />
        </div>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Sửa Giao Dịch Thu" footer={<><Button variant="ghost" onClick={() => setIsEditOpen(false)}>Hủy</Button><Button onClick={handleSaveEdit}>Lưu</Button></>}>
        {editingRow && (
          <div className="flex flex-col gap-4">
            <Input label="Số Lượng" type="number" value={editingRow.quantity} onChange={(e) => setEditingRow({...editingRow, quantity: Number(e.target.value)})} />
            <Input label="Số Tiền" type="number" value={editingRow.amount} onChange={(e) => setEditingRow({...editingRow, amount: Number(e.target.value)})} />
          </div>
        )}
      </Modal>
    </div>
  );
};
