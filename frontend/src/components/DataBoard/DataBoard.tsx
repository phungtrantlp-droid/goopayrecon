import React from 'react';
import { flexRender, Header } from '@tanstack/react-table';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDataBoard } from './useDataBoard';
import { Database, ArrowUpDown, ArrowDown, ArrowUp } from 'lucide-react';

interface DataBoardProps<T extends Record<string, unknown>> {
  data: T[];
  columns: any[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  getRowClassName?: (row: T) => string;
}

function DraggableColumnHeader({ header }: { header: Header<any, any> }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: header.column.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, width: header.getSize() };

  return (
    <th ref={setNodeRef} style={style} className="relative px-4 py-3 text-left text-sm font-semibold text-gray-300 bg-surface-card border-b border-border-color whitespace-nowrap select-none">
      <div className="flex items-center gap-2">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing hover:text-white flex-1 flex items-center gap-1">
          {flexRender(header.column.columnDef.header, header.getContext())}
        </div>
        {header.column.getCanSort() && (
          <div className="cursor-pointer text-gray-500 hover:text-white" onClick={header.column.getToggleSortingHandler()}>
            {{
              asc: <ArrowUp className="w-3 h-3" />,
              desc: <ArrowDown className="w-3 h-3" />,
            }[header.column.getIsSorted() as string] ?? <ArrowUpDown className="w-3 h-3" />}
          </div>
        )}
      </div>
      {header.column.getCanResize() && (
        <div 
          onMouseDown={header.getResizeHandler()} 
          onTouchStart={header.getResizeHandler()} 
          className={`resizer ${header.column.getIsResizing() ? 'isResizing' : ''}`} 
        />
      )}
    </th>
  );
}

export function DataBoard<T extends Record<string, unknown>>({ data, columns, isLoading, emptyMessage = 'Không có dữ liệu', onRowClick, getRowClassName }: DataBoardProps<T>) {
  const { table, columnOrder, sensors, handleDragStart, handleDragEnd } = useDataBoard(data, columns);

  return (
    <div className="glass-card rounded-lg overflow-hidden border border-border-color flex flex-col w-full h-full">
      <div className="overflow-auto max-h-[calc(100vh-280px)] relative">
        <table className="w-full text-sm text-left table-fixed" style={{ width: table.getTotalSize() }}>
          <thead className="sticky top-0 z-10 bg-surface">
            {table.getHeaderGroups().map((headerGroup) => (
              <DndContext key={headerGroup.id} sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <tr>
                  <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                    {headerGroup.headers.map((header) => (
                      <DraggableColumnHeader key={header.id} header={header} />
                    ))}
                  </SortableContext>
                </tr>
              </DndContext>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border-color">
                  {columns.map((col, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-white/5 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400">
                  <Database className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr 
                  key={row.id} 
                  onClick={() => onRowClick?.(row.original)}
                  className={`border-b border-border-color hover:bg-white/5 transition-colors ${onRowClick ? 'cursor-pointer' : ''} ${getRowClassName?.(row.original) || ''}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 truncate" style={{ width: cell.column.getSize() }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
