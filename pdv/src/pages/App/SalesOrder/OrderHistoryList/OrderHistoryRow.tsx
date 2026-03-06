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
        <tr className={`transition-colors group ${order.status === 'scheduled' ? 'hover:bg-blue-50/30' : 'bg-slate-50/50 hover:bg-slate-100/50'}`}>
            {visibilitySettings.id && (
                <td className="px-6 py-4">
                    <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">{order.id?.slice(-8)}</span>
                </td>
            )}
            {visibilitySettings.orderDate && (
                <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-slate-700">{order.date}</span>
                        {order.status === 'draft' && isIncomplete && (
                            <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 bg-orange-50 px-2 py-0.5 rounded-md w-fit">
                                Incompleto
                            </span>
                        )}
                    </div>
                </td>
            )}
            {visibilitySettings.deliveryDate && (
                <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">{order.shipping?.scheduling?.date || "-"}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            {order.shipping?.scheduling?.time || "-"}
                        </span>
                    </div>
                </td>
            )}
            {visibilitySettings.customer && (
                <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-700">{order.customerData?.fullName || "Não informado"}</span>
                </td>
            )}
            {visibilitySettings.totalValue && (
                <td className="px-6 py-4">
                    <span className="text-sm font-black text-blue-600">{formatCurrency(order.paymentsSummary.totalOrderValue || 0)}</span>
                </td>
            )}
            {visibilitySettings.status && (
                <td className="px-6 py-4 relative">
                    <button
                        onClick={() => setShowPicker(!showPicker)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${currentStatus.bg} w-fit hover:brightness-95 transition-all active:scale-95`}
                    >
                        <div className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot} animate-pulse`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${currentStatus.text}`}>{currentStatus.label}</span>
                        <i className="bi bi-chevron-down text-[8px] opacity-30" />
                    </button>

                    {showPicker && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowPicker(false)} />
                            <div className="absolute top-[calc(100%-8px)] left-6 w-40 bg-white border border-slate-100 rounded-2xl shadow-xl p-2 flex flex-col gap-1 z-20 animate-slide-up">
                                {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map((key) => {
                                    const s = statusConfig[key];
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => {
                                                onStatusUpdate(order.id!, key);
                                                setShowPicker(false);
                                            }}
                                            className={`flex items-center gap-3 p-2.5 rounded-xl transition-all hover:bg-slate-50 group/item ${order.status === key ? 'bg-blue-50/50' : ''}`}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${order.status === key ? 'text-blue-600' : 'text-slate-500'}`}>
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
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm bg-white border border-slate-100"
                            title="Editar Pedido"
                        >
                            <i className="bi bi-pencil-fill text-sm" />
                        </button>

                        <div className="h-4 w-[1px] bg-slate-100 mx-1" />

                        {buttons.map((btn) => (
                            <button
                                key={btn.key}
                                onClick={() => onAction(btn.key, order)}
                                className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all shadow-sm bg-white border border-slate-100"
                                title={btn.label}
                            >
                                <i className={`bi ${btn.icon} text-sm`} />
                            </button>
                        ))}

                        <div className="h-4 w-[1px] bg-slate-100 mx-1" />

                        <button
                            onClick={() => onDelete(order.id!)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm bg-white border border-slate-100"
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
