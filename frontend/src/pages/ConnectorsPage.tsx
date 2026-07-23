import React, { useState, useEffect } from 'react';
import { Link2, Plus, Edit2, Trash2, Power } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getConnectors, createConnector, updateConnector, deleteConnector, toggleConnectorActive } from '../api/connectors';
import { Connector } from '../types';
import { useAuthStore } from '../store/authStore';
import { Button, Input, Modal, Badge } from '../components/ui';

export const ConnectorsPage: React.FC = () => {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConnector, setEditingConnector] = useState<Connector | null>(null);
  const { canEdit, isAdmin } = useAuthStore();

  const [formData, setFormData] = useState<Partial<Connector>>({
    connectorCode: '', connectorName: '', isActive: true
  });

  const fetchConnectors = async () => {
    setLoading(true);
    try {
      const data = await getConnectors();
      setConnectors(data);
    } catch (e) {
      toast.error('Lỗi khi tải danh sách connector');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnectors();
  }, []);

  const handleSave = async () => {
    try {
      if (editingConnector) {
        await updateConnector(editingConnector.connectorCode, formData);
        toast.success('Cập nhật thành công');
      } else {
        await createConnector(formData);
        toast.success('Thêm mới thành công');
      }
      setIsModalOpen(false);
      fetchConnectors();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Lỗi khi lưu');
    }
  };

  const handleDelete = async (code: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa connector này?')) return;
    try {
      await deleteConnector(code);
      toast.success('Xóa thành công');
      fetchConnectors();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Lỗi khi xóa. Connector có thể đang được sử dụng.');
    }
  };

  const handleToggle = async (code: string) => {
    try {
      await toggleConnectorActive(code);
      toast.success('Thay đổi trạng thái thành công');
      fetchConnectors();
    } catch (e: any) {
      toast.error('Lỗi thay đổi trạng thái');
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-white">
          <div className="p-2 bg-primary/20 rounded-lg"><Link2 className="w-6 h-6 text-primary" /></div>
          <h1 className="text-2xl font-bold">Quản lý Connector</h1>
        </div>
        {canEdit() && (
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => { setEditingConnector(null); setFormData({ isActive: true }); setIsModalOpen(true); }}>
            Thêm Connector
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-xl border border-border-color border-l-4 border-l-blue-500">
          <div className="text-gray-400 text-sm">Tổng số Connector</div>
          <div className="text-3xl font-bold text-white mt-2">{connectors.length}</div>
        </div>
        <div className="glass-card p-6 rounded-xl border border-border-color border-l-4 border-l-green-500">
          <div className="text-gray-400 text-sm">Đang hoạt động</div>
          <div className="text-3xl font-bold text-white mt-2">{connectors.filter(c => c.isActive).length}</div>
        </div>
        <div className="glass-card p-6 rounded-xl border border-border-color border-l-4 border-l-red-500">
          <div className="text-gray-400 text-sm">Ngừng hoạt động</div>
          <div className="text-3xl font-bold text-white mt-2">{connectors.filter(c => !c.isActive).length}</div>
        </div>
      </div>

      <div className="glass-card rounded-lg overflow-hidden border border-border-color">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface-card border-b border-border-color text-gray-300">
            <tr>
              <th className="px-4 py-3">Mã Connector</th>
              <th className="px-4 py-3">Tên Connector</th>
              <th className="px-4 py-3">Trạng thái</th>
              {canEdit() && <th className="px-4 py-3 text-right">Hành động</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Đang tải...</td></tr>
            ) : connectors.map((c) => (
              <tr key={c.id} className="border-b border-border-color hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-medium text-white">{c.connectorCode}</td>
                <td className="px-4 py-3">{c.connectorName}</td>
                <td className="px-4 py-3">
                  <Badge variant={c.isActive ? 'green' : 'gray'} showDot>{c.isActive ? 'Hoạt động' : 'Tạm dừng'}</Badge>
                </td>
                {canEdit() && (
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleToggle(c.connectorCode)} title="Đổi trạng thái" className={`p-1.5 rounded mr-2 transition-colors ${c.isActive ? 'text-orange-400 hover:bg-orange-400/10' : 'text-green-400 hover:bg-green-400/10'}`}>
                      <Power className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setEditingConnector(c); setFormData(c); setIsModalOpen(true); }} className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded mr-2"><Edit2 className="w-4 h-4" /></button>
                    {isAdmin() && <button onClick={() => handleDelete(c.connectorCode)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded"><Trash2 className="w-4 h-4" /></button>}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingConnector ? 'Sửa Connector' : 'Thêm Connector'}
        footer={<><Button variant="ghost" onClick={() => setIsModalOpen(false)}>Hủy</Button><Button onClick={handleSave}>Lưu</Button></>}>
        <div className="flex flex-col gap-4">
          <Input label="Mã Connector" value={formData.connectorCode || ''} onChange={(e) => setFormData({...formData, connectorCode: e.target.value})} disabled={!!editingConnector} />
          <Input label="Tên Connector" value={formData.connectorName || ''} onChange={(e) => setFormData({...formData, connectorName: e.target.value})} />
        </div>
      </Modal>
    </div>
  );
};
