import { ColumnDef } from '@tanstack/react-table';
import { Transaction } from '../types';
import { formatDate, formatCurrency, formatNumber } from './formatters';

export const standardTransactionColumns: ColumnDef<Transaction, any>[] = [
  {
    id: 'date',
    header: 'Ngày',
    accessorKey: 'date',
    cell: (info) => formatDate(info.getValue()),
    size: 120,
    minSize: 80,
    enableResizing: true,
    enableSorting: true,
  },
  {
    id: 'parentCode',
    header: 'Mã ĐT Cha',
    accessorFn: (row) => row.partner?.parent?.partnerCode || '',
    size: 120,
    minSize: 80,
    enableResizing: true,
    enableSorting: true,
  },
  {
    id: 'partnerCode',
    header: 'Mã Đối Tác',
    accessorKey: 'partnerCode',
    size: 120,
    minSize: 80,
    enableResizing: true,
    enableSorting: true,
  },
  {
    id: 'partnerName',
    header: 'Tên Đối Tác',
    accessorFn: (row) => row.partner?.partnerName || '',
    size: 200,
    minSize: 100,
    enableResizing: true,
    enableSorting: true,
  },
  {
    id: 'transactionType',
    header: 'Loại GD',
    accessorKey: 'transactionType',
    size: 100,
    minSize: 80,
    enableResizing: true,
    enableSorting: true,
  },
  {
    id: 'quantity',
    header: 'Số Lượng',
    accessorKey: 'quantity',
    cell: (info) => <div className="text-right">{formatNumber(info.getValue())}</div>,
    size: 120,
    minSize: 80,
    enableResizing: true,
    enableSorting: true,
  },
  {
    id: 'amount',
    header: 'Số Tiền',
    accessorKey: 'amount',
    cell: (info) => {
      const val = info.getValue();
      const type = info.row.original.transactionType;
      const color = type === 'CHI' ? 'text-red-400' : type === 'THU' ? 'text-green-400' : 'text-purple-400';
      return <div className={`text-right font-medium ${color}`}>{formatCurrency(val)}</div>;
    },
    size: 150,
    minSize: 100,
    enableResizing: true,
    enableSorting: true,
  },
  {
    id: 'connectorCode',
    header: 'Connector',
    accessorKey: 'connectorCode',
    cell: (info) => (
      <span className="px-2 py-1 bg-surface-light border border-border-color rounded text-xs">
        {info.getValue()}
      </span>
    ),
    size: 120,
    minSize: 80,
    enableResizing: true,
    enableSorting: true,
  },
  {
    id: 'notes',
    header: 'Ghi chú',
    accessorKey: 'notes',
    size: 200,
    minSize: 100,
    enableResizing: true,
    enableSorting: true,
  },
];
