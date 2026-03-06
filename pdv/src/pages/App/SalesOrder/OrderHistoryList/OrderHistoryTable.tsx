import React from "react";
import Order from "../../../types/pdvAction.type";
import OrderHistoryRow from "./OrderHistoryRow";
import { VisibilitySettings } from "./index";

interface OrderHistoryTableProps {
    orders: Order[];
    onEdit: (order: Order) => void;
    onDelete: (id: string) => void;
    onAction: (actionKey: string, order: Order) => void;
    onStatusUpdate: (id: string, newStatus: Order['status']) => void;
    visibilitySettings: VisibilitySettings;
}

const OrderHistoryTable = ({ orders, onEdit, onDelete, onAction, onStatusUpdate, visibilitySettings }: OrderHistoryTableProps) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-colors">
                        {visibilitySettings.id && <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">ID do Pedido</th>}
                        {visibilitySettings.orderDate && <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Data</th>}
                        {visibilitySettings.deliveryDate && <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Entrega</th>}
                        {visibilitySettings.customer && <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Cliente</th>}
                        {visibilitySettings.totalValue && <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 text-right">Valor Total</th>}
                        {visibilitySettings.status && <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 text-center">Status</th>}
                        {visibilitySettings.actions && <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 text-center">Ações</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {orders.map((order) => (
                        <OrderHistoryRow
                            key={order.id}
                            order={order}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onAction={onAction}
                            onStatusUpdate={onStatusUpdate}
                            visibilitySettings={visibilitySettings}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrderHistoryTable;
