import React from "react";
import OrderHistoryRow from "./OrderHistoryRow";
import Order, { VisibilitySettings } from "../../../types/order.type";
import { getSettings } from "../../../utils/settingsService";
import { useAutoScroll } from "../../../utils/useAutoScroll";

interface OrderHistoryTableProps {
    orders: Order[];
    onEdit: (order: Order) => void;
    onDelete: (id: string) => void;
    onRestore: (id: string) => void;
    onPermanentDelete: (id: string) => void;
    onAction: (actionKey: string, order: Order) => void;
    onStatusUpdate: (id: string, newStatus: Order['status']) => void;
    onViewDetails: (order: Order) => void;
    visibilitySettings: VisibilitySettings;
    onToggleColumn: (column: keyof VisibilitySettings) => void;
    showTrash?: boolean;
    selectedOrders: string[];
    onToggleSelection: (id: string) => void;
    onSelectAll: () => void;
    onBulkTrash: () => void;
    onBulkRestore: () => void;
    onBulkPermanentDelete: () => void;
    onClearSelection: () => void;
}

interface ColumnDef {
    key: keyof VisibilitySettings;
    label: string | ((showTrash?: boolean) => string);
    align?: string;
}

const COLUMNS_DEF: ColumnDef[] = [
    { key: 'id', label: 'ID do Pedido' },
    { key: 'orderDate', label: (trash?: boolean) => trash ? 'Excluído em' : 'Data' },
    { key: 'deliveryDate', label: 'Entrega' },
    { key: 'customer', label: 'Cliente' },
    { key: 'totalValue', label: 'Valor Total', align: 'text-right' },
    { key: 'status', label: 'Status', align: 'text-center' },
    { key: 'modality', label: 'Modalidade' },
    { key: 'manuseio', label: 'Manuseio' },
    { key: 'actions', label: 'Ações', align: 'text-center' },
];



const OrderHistoryTable = ({
    orders, onEdit, onDelete, onRestore, onPermanentDelete, onAction, onStatusUpdate, onViewDetails,
    visibilitySettings, onToggleColumn, showTrash,
    selectedOrders, onToggleSelection, onSelectAll, onBulkTrash, onBulkRestore, onBulkPermanentDelete, onClearSelection
}: OrderHistoryTableProps) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const settings = getSettings();
    const allIdsOnPage = orders.map(o => o.id!).filter(Boolean);
    const isAllSelected = allIdsOnPage.length > 0 && allIdsOnPage.every(id => selectedOrders.includes(id));
    const isIndeterminate = selectedOrders.length > 0 && !isAllSelected;

    // Enable auto-scroll on hover near borders if enabled in settings
    useAutoScroll(containerRef, {
        direction: 'horizontal',
        threshold: settings.autoScroll.threshold,
        maxSpeed: settings.autoScroll.speed,
        enabled: settings.autoScroll.orderTable
    });

    const [orderedColumns, setOrderedColumns] = React.useState<ColumnDef[]>(() => {
        const savedOrder = localStorage.getItem('order_table_column_order');
        if (savedOrder) {
            try {
                const keys = JSON.parse(savedOrder) as string[];
                return keys.map(key => COLUMNS_DEF.find(c => c.key === key)!).filter(Boolean);
            } catch (e) {
                return COLUMNS_DEF;
            }
        }
        return COLUMNS_DEF;
    });

    const [draggedColumn, setDraggedColumn] = React.useState<string | null>(null);

    React.useEffect(() => {
        localStorage.setItem('order_table_column_order', JSON.stringify(orderedColumns.map(c => c.key)));
    }, [orderedColumns]);

    const handleDragStart = (e: React.DragEvent, key: string) => {
        setDraggedColumn(key);
        e.dataTransfer.setData('columnKey', key);
        e.dataTransfer.effectAllowed = 'move';

        // Custom drag image could be set here if needed
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetKey: string) => {
        e.preventDefault();
        const draggedKey = e.dataTransfer.getData('columnKey');
        if (draggedKey === targetKey) return;

        const newOrder = [...orderedColumns];
        const draggedIdx = newOrder.findIndex(c => c.key === draggedKey);
        const targetIdx = newOrder.findIndex(c => c.key === targetKey);

        const [removed] = newOrder.splice(draggedIdx, 1);
        newOrder.splice(targetIdx, 0, removed);

        setOrderedColumns(newOrder);
        setDraggedColumn(null);
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Bulk Actions Toolbar */}
            {selectedOrders.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-2xl p-4 flex items-center justify-between shadow-sm animate-slide-up">
                    <span className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                        {selectedOrders.length} pedido(s) selecionado(s)
                    </span>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClearSelection}
                            className="bg-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>

                        {!showTrash ? (
                            <button
                                onClick={onBulkTrash}
                                className="bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-2"
                            >
                                <i className="bi bi-trash-fill" />
                                Mover Selecionados para Lixeira
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={onBulkRestore}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-2"
                                >
                                    <i className="bi bi-arrow-counterclockwise" />
                                    Restaurar Selecionados
                                </button>
                                <button
                                    onClick={onBulkPermanentDelete}
                                    className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-2"
                                >
                                    <i className="bi bi-trash3-fill" />
                                    Excluir Definitivamente
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            <div ref={containerRef} className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-colors">
                            {/* Checkbox Header */}
                            <th className="px-6 py-4 w-12 text-center">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        ref={input => {
                                            if (input) input.indeterminate = isIndeterminate;
                                        }}
                                        onChange={onSelectAll}
                                        className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-900 focus:ring-2 dark:bg-slate-800 dark:border-slate-700 cursor-pointer"
                                    />
                                </label>
                            </th>
                            {orderedColumns.map((col) => {
                                const labelText = typeof col.label === 'function' ? col.label(showTrash) : col.label;
                                const isVisible = visibilitySettings[col.key];

                                if (!isVisible) return null;

                                return (
                                    <th
                                        key={col.key}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, col.key as string)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, col.key as string)}
                                        onDragEnd={() => setDraggedColumn(null)}
                                        className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 cursor-grab active:cursor-grabbing hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${col.align || ''} ${draggedColumn === col.key ? 'opacity-20' : 'opacity-100'}`}
                                    >
                                        <div className={`flex items-center gap-2 ${col.align === 'text-right' ? 'justify-end' : col.align === 'text-center' ? 'justify-center' : ''}`}>
                                            <i className="bi bi-grip-vertical text-slate-300 dark:text-slate-700 mr-1" />
                                            <span>{labelText}</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onToggleColumn(col.key); }}
                                                className="p-1 text-slate-300 dark:text-slate-600 hover:text-red-400 transition-colors rounded"
                                                title={`Ocultar ${labelText}`}
                                            >
                                                <i className="bi bi-eye-slash text-[10px]" />
                                            </button>
                                        </div>
                                    </th>
                                );
                            })}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {orders.map((order) => (
                        <OrderHistoryRow
                            key={order.id}
                            order={order}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onRestore={onRestore}
                            onPermanentDelete={onPermanentDelete}
                            onAction={onAction}
                            onStatusUpdate={onStatusUpdate}
                            onViewDetails={onViewDetails}
                            visibilitySettings={visibilitySettings}
                            showTrash={showTrash}
                            orderedColumnKeys={orderedColumns.map(c => c.key as string)}
                            isSelected={selectedOrders.includes(order.id!)}
                            onToggleSelection={() => onToggleSelection(order.id!)}
                        />
                    ))}
                </tbody>
            </table>
        </div>
        </div>
    );
};

export default OrderHistoryTable;
