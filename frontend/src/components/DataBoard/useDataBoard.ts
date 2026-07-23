import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  ColumnDef,
  SortingState,
  ColumnOrderState,
} from '@tanstack/react-table';
import {
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';

export function useDataBoard<T>(data: T[], columns: ColumnDef<T, any>[]) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(
    columns.map((c) => c.id as string)
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnOrder,
    },
    onSortingChange: setSorting,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: 'onChange',
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setColumnOrder((order) => {
        const oldIndex = order.indexOf(active.id as string);
        const newIndex = order.indexOf(over.id as string);
        return arrayMove(order, oldIndex, newIndex);
      });
    }
  };

  return {
    table,
    columnOrder,
    setColumnOrder,
    sensors,
    handleDragStart,
    handleDragEnd,
    activeId,
  };
}
