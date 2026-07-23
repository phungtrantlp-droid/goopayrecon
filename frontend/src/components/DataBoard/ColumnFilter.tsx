import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Filter, RotateCcw } from 'lucide-react';
import { Input, Select, Button } from '../ui';
import { FilterState, Partner, Connector } from '../../types';

interface ColumnFilterProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  partners?: Partner[];
  connectors?: Connector[];
  serviceTypes?: string[];
}

export const ColumnFilter: React.FC<ColumnFilterProps> = ({ filters, onChange, partners = [], connectors = [], serviceTypes = [] }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleChange = (field: keyof FilterState, value: any) => {
    onChange({ ...filters, [field]: value || undefined });
  };

  const handleReset = () => {
    onChange({});
  };

  const parentOptions = partners
    .filter(p => !p.parentId)
    .map(p => ({ label: `${p.partnerCode} - ${p.partnerName}`, value: p.partnerCode }));

  const partnerOptions = partners
    .map(p => ({ label: `${p.partnerCode} - ${p.partnerName}`, value: p.partnerCode }));

  const connectorOptions = connectors
    .map(c => ({ label: `${c.connectorCode} - ${c.connectorName}`, value: c.connectorCode }));

  const serviceOptions = serviceTypes
    .map(t => ({ label: t, value: t }));

  return (
    <div className="glass-card rounded-lg mb-4">
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 transition-colors rounded-t-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
          <Filter className="w-4 h-4" />
          <span>Bộ lọc dữ liệu</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>
      
      {isOpen && (
        <div className="p-4 border-t border-border-color grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
          <Input 
            type="date" 
            label="Từ ngày" 
            value={filters.fromDate || ''} 
            onChange={(e) => handleChange('fromDate', e.target.value)} 
          />
          <Input 
            type="date" 
            label="Đến ngày" 
            value={filters.toDate || ''} 
            onChange={(e) => handleChange('toDate', e.target.value)} 
          />
          <Select 
            label="Mã ĐT Cha" 
            options={parentOptions} 
            value={filters.parentPartnerCode || ''} 
            onChange={(e) => handleChange('parentPartnerCode', e.target.value)} 
          />
          <Select 
            label="Mã Đối Tác" 
            options={partnerOptions} 
            value={filters.partnerCode || ''} 
            onChange={(e) => handleChange('partnerCode', e.target.value)} 
          />
          <Select 
            label="Connector" 
            options={connectorOptions} 
            value={filters.connectorCode || ''} 
            onChange={(e) => handleChange('connectorCode', e.target.value)} 
          />
          {serviceTypes.length > 0 && (
            <Select 
              label="Loại dịch vụ" 
              options={serviceOptions} 
              value={filters.serviceType || ''} 
              onChange={(e) => handleChange('serviceType', e.target.value)} 
            />
          )}
          
          <div className="flex items-end lg:col-start-4 justify-end">
            <Button variant="ghost" leftIcon={<RotateCcw className="w-4 h-4" />} onClick={handleReset}>
              Làm mới
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
