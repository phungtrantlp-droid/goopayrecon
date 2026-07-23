import React, { useState, useEffect } from 'react';
import { Users, Plus, Upload, Download, Search, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getPartners, createPartner, updatePartner, deletePartner, uploadPartners, downloadTemplate } from '../api/partners';
import { Partner } from '../types';
import { useAuthStore } from '../store/authStore';
import { Button, Input, Modal, Badge, Select } from '../components/ui';

export const PartnersPage: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const { canEdit, isAdmin } = useAuthStore();

  const [formData, setFormData] = useState<Partial<Partner>>({
    partnerCode: '', partnerName: '', serviceType: '', email: '', bankName: '', bankAccount: '', parentId: '', isActive: true
  });

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const data = await getPartners();
      setPartners(data);
    } catch (e: any) {
      toast.error('Lỗi khi tải danh sách đối tác');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleSave = async () => {
    try {
      if (editingPartner) {
        await updatePartner(editingPartner.partnerCode, formData);
        toast.success('Cập nhật thành công');
      } else {
        await createPartner(formData);
        toast.success('Thêm mới thành công');
      }
      setIsModalOpen(false);
      fetchPartners();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Lỗi khi lưu');
    }
  };

  const handleDelete = async (code: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đối tác này?')) return;
    try {
      await deletePartner(code);
      toast.success('Xóa thành công');
      fetchPartners();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Lỗi khi xóa');
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadPartners(file);
      toast.success(`Upload thành công: ${res.successCount} bản ghi. Lỗi: ${res.failedCount}`);
      setIsUploadOpen(false);
      fetchPartners();
    } catch (e: any) {
      toast.error('Lỗi khi upload');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'partners_template.xlsx';
      a.click();
    } catch (e) {
      toast.error('Lỗi tải template');
    }
  };

  const filteredPartners = partners.filter(p => 
    p.partnerCode.toLowerCase().includes(search.toLowerCase()) || 
    p.partnerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-white">
          <div className="p-2 bg-primary/20 rounded-lg"><Users className="w-6 h-6 text-primary" /></div>
          <h1 className="text-2xl font-bold">Quản lý Đối Tác</h1>
        </div>
        
        {canEdit() && (
          <div className="flex gap-3">
            <Button variant="outline" leftIcon={<Download className="w-4 h-4" />} onClick={handleDownloadTemplate}>Template</Button>
            <Button variant="secondary" leftIcon={<Upload className="w-4 h-4" />} onClick={() => setIsUploadOpen(true)}>Upload</Button>
            <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => { setEditingPartner(null); setFormData({ isActive: true }); setIsModalOpen(true); }}>Thêm Mới</Button>
          </div>
        )}
      </div>

      <div className="glass-card rounded-lg p-4 flex gap-4">
        <div className="w-64">
          <Input placeholder="Tìm kiếm mã hoặc tên..." value={search} onChange={(e) => setSearch(e.target.value)} prefix={<Search className="w-4 h-4" />} />
        </div>
      </div>

      <div className="glass-card rounded-lg overflow-hidden border border-border-color">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-card border-b border-border-color text-gray-300">
              <tr>
                <th className="px-4 py-3">Mã ĐT Cha</th>
                <th className="px-4 py-3">Mã ĐT</th>
                <th className="px-4 py-3">Tên Đối Tác</th>
                <th className="px-4 py-3">Loại DV</th>
                <th className="px-4 py-3">Trạng thái</th>
                {canEdit() && <th className="px-4 py-3 text-right">Hành động</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Đang tải...</td></tr>
              ) : filteredPartners.map((p) => (
                <tr key={p.id} className="border-b border-border-color hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">{p.parentId ? <Badge>{p.parent?.partnerCode}</Badge> : '-'}</td>
                  <td className="px-4 py-3 font-medium text-white">{p.partnerCode}</td>
                  <td className="px-4 py-3">{p.partnerName}</td>
                  <td className="px-4 py-3">{p.serviceType}</td>
                  <td className="px-4 py-3">
                    <Badge variant={p.isActive ? 'green' : 'red'} showDot>{p.isActive ? 'Hoạt động' : 'Đã khóa'}</Badge>
                  </td>
                  {canEdit() && (
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => { setEditingPartner(p); setFormData(p); setIsModalOpen(true); }} className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded mr-2"><Edit2 className="w-4 h-4" /></button>
                      {isAdmin() && <button onClick={() => handleDelete(p.partnerCode)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded"><Trash2 className="w-4 h-4" /></button>}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPartner ? 'Sửa Đối Tác' : 'Thêm Đối Tác'} size="lg"
        footer={<><Button variant="ghost" onClick={() => setIsModalOpen(false)}>Hủy</Button><Button onClick={handleSave}>Lưu</Button></>}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Mã Đối Tác" value={formData.partnerCode || ''} onChange={(e) => setFormData({...formData, partnerCode: e.target.value})} disabled={!!editingPartner} />
          <Input label="Tên Đối Tác" value={formData.partnerName || ''} onChange={(e) => setFormData({...formData, partnerName: e.target.value})} />
          <Input label="Loại Dịch Vụ" value={formData.serviceType || ''} onChange={(e) => setFormData({...formData, serviceType: e.target.value})} />
          <Input label="Email" type="email" value={formData.email || ''} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          <Input label="Ngân Hàng" value={formData.bankName || ''} onChange={(e) => setFormData({...formData, bankName: e.target.value})} />
          <Input label="Số Tài Khoản" value={formData.bankAccount || ''} onChange={(e) => setFormData({...formData, bankAccount: e.target.value})} />
        </div>
      </Modal>

      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Upload Excel" size="md">
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border-color rounded-lg bg-surface hover:border-primary transition-colors">
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-300 mb-2">Kéo thả file hoặc click để chọn</p>
          <input type="file" accept=".xlsx,.xls" onChange={handleUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-light" />
        </div>
      </Modal>
    </div>
  );
};
