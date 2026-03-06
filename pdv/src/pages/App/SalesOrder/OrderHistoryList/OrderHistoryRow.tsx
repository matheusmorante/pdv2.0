import React from "react";
import Order from "../../../types/pdvAction.type";
import { formatCurrency } from "../../../utils/formatters";
import { buttons } from "../PdvActions/pdvActionsConfig";
import { isOrderIncomplete } from "../../../utils/validations";
import { VisibilitySettings } from "./index";

interface OrderHistoryRowProps {
    order: Order;
    onEdit: (order: Order) => void;
    onDelete: (id: string) => void;
    onAction: (actionKey: string, order: Order) => void;
    onStatusUpdate: (id: string, newStatus: Order['status']) => void;
    visibilitySettings: VisibilitySettings;
}

const OrderHistoryRow = ({ order, onEdit, onDelete, onAction, onStatusUpdate, visibilitySettings }: OrderHistoryRowProps) => {
    const [showPicker, setShowPicker] = React.useState(false);
    const isIncomplete = isOrderIncomplete(order);

    const statusConfig = {
        draft: { label: 'Rascunho', bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' },
        scheduled: { label: 'Agendado', bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
        fulfilled: { label: 'Atendido', bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
        cancelled: { label: 'Cancelado', bg: 'bg-rose-50', text: 'text-rose-600', dot: 'bg-rose-500' },
    };

    const statusKey = (order.status as string) === 'completed' ? 'scheduled' : (order.status || 'draft');
    const currentStatus = statusConfig[statusKey as keyof typeof statusConfig] || statusConfig.draft;

    return (
        <tr className={`transition-colors group ${order.status === 'scheduled' ? 'hover:bg-blue-50/30 dark:hover:bg-blue-900/10' : 'bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'}`}>
            {visibilitySettings.id && (
                <td className="px-6 py-4">
                    <span className="font-mono text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">{order.id?.slice(-8)}</span>
                </td>
            )}
            {visibilitySettings.orderDate && (
                <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{order.date}</span>
                        {order.status === 'draft' && isIncomplete && (
                            <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 dark:text-orange-500 bg-orange-50 dark:bg-orange-950/30 px-2 py-0.5 rounded-md w-fit">
                                Incompleto
                            </span>
                        )}
                    </div>
                </td>
            )}
            {visibilitySettings.deliveryDate && (
                <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{order.shipping?.scheduling?.date || "-"}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest">
                            {order.shipping?.scheduling?.time || "-"}
                        </span>
                    </div>
                </td>
            )}
            {visibilitySettings.customer && (
                <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{order.customerData?.fullName || "Não informado"}</span>
                </td>
            )}
            {visibilitySettings.totalValue && (
                <td className="px-6 py-4">
                    <span className="text-sm font-black text-blue-600 dark:text-blue-400">{formatCurrency(order.paymentsSummary.totalOrderValue || 0)}</span>
                </td>
            )}
            {visibilitySettings.status && (
                <td className="px-6 py-4 relative">
                    <button
                        onClick={() => setShowPicker(!showPicker)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${currentStatus.bg} dark:bg-opacity-10 w-fit hover:brightness-95 dark:hover:brightness-125 transition-all active:scale-95`}
                    >
                        <div className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot} animate-pulse`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${currentStatus.text}`}>{currentStatus.label}</span>
                        <i className="bi bi-chevron-down text-[8px] opacity-30 dark:text-slate-100" />
                    </button>

                    {showPicker && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowPicker(false)} />
                            <div className="absolute top-[calc(100%-8px)] left-6 w-40 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl dark:shadow-none p-2 flex flex-col gap-1 z-20 animate-slide-up">
                                {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map((key) => {
                                    const s = statusConfig[key];
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => {
                                                onStatusUpdate(order.id!, key);
                                                setShowPicker(false);
                                            }}
                                            className={`flex items-center gap-3 p-2.5 rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-slate-950 group/item ${order.status === key ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${order.status === key ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-500'}`}>
                                                {s.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </td>
            )}
            {visibilitySettings.actions && (
                <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                        <button
                            onClick={() => onEdit(order)}
                            className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all shadow-sm bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800"
                            title="Editar Pedido"
                        >
                            <i className="bi bi-pencil-fill text-sm" />
                        </button>

                        <div className="h-4 w-[1px] bg-slate-100 dark:bg-slate-800 mx-1" />

                        {buttons.map((btn) => (
                            <button
                                key={btn.key}
                                onClick={() => onAction(btn.key, order)}
                                className="p-2 text-slate-400 dark:text-slate-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-xl transition-all shadow-sm bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800"
                                title={btn.label}
                            >
                                <i className={`bi ${btn.icon} text-sm`} />
                            </button>
                        ))}

                        <div className="h-4 w-[1px] bg-slate-100 dark:bg-slate-800 mx-1" />

                        <button
                            onClick={() => onDelete(order.id!)}
                            className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all shadow-sm bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800"
                            title="Excluir Pedido"
                        >
                            <i className="bi bi-trash-fill text-sm" />
                        </button>
                    </div>
                </td>
            )}
        </tr>
    );
};

export default OrderHistoryRow;
