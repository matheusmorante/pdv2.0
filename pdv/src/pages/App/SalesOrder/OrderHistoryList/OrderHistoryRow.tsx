import React from "react";
import Order, { VisibilitySettings } from "../../../types/order.type";
import { getSettings } from "../../../utils/settingsService";
import { formatCurrency } from "../../../utils/formatters";
import { buttons } from "../OrderActions/orderActionsConfig";
import { isOrderIncomplete } from "../../../utils/validations";

interface OrderHistoryRowProps {
    order: Order;
    onEdit: (order: Order) => void;
    onDelete: (id: string) => void;
    onRestore: (id: string) => void;
    onPermanentDelete: (id: string) => void;
    onAction: (actionKey: string, order: Order) => void;
    onStatusUpdate: (id: string, newStatus: Order['status']) => void;
    onViewDetails: (order: Order) => void;
    visibilitySettings: VisibilitySettings;
    showTrash?: boolean;
    orderedColumnKeys?: string[];
    isSelected?: boolean;
    onToggleSelection?: () => void;
}

const OrderHistoryRow = ({
    order,
    onEdit,
    onDelete,
    onRestore,
    onPermanentDelete,
    onAction,
    onStatusUpdate,
    onViewDetails,
    visibilitySettings,
    showTrash,
    orderedColumnKeys,
    isSelected,
    onToggleSelection
}: OrderHistoryRowProps) => {
    const [showPicker, setShowPicker] = React.useState(false);
    const [showMenu, setShowMenu] = React.useState(false);
    const [showFulfillmentConfirm, setShowFulfillmentConfirm] = React.useState(false);
    const settings = getSettings();
    const isIncomplete = isOrderIncomplete(order);

    const statuses = settings.orderStatuses || [
        { id: 'draft', label: 'Rascunho', color: 'slate', isCore: true },
        { id: 'scheduled', label: 'Agendado', color: 'amber', isCore: true },
        { id: 'fulfilled', label: 'Atendido', color: 'emerald', isCore: true },
        { id: 'cancelled', label: 'Cancelado', color: 'rose', isCore: true },
    ];

    const statusConfig: Record<string, { label: string, bg: string, text: string, dot: string }> = {};
    statuses.forEach(s => {
        statusConfig[s.id] = {
            label: s.label,
            bg: `bg-${s.color}-${s.color === 'slate' ? '100' : '50'}`,
            text: `text-${s.color}-${s.color === 'slate' ? '500' : '600'}`,
            dot: `bg-${s.color}-${s.color === 'slate' ? '400' : '500'}`,
        };
    });

    // Fallbacks just in case
    if (!statusConfig.draft) statusConfig.draft = { label: 'Rascunho', bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' };
    if (!statusConfig.fulfilled) statusConfig.fulfilled = { label: 'Atendido', bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' };

    const statusKey = (order.status as string) === 'completed' ? 'scheduled' : (order.status || 'draft');
    const currentStatus = statusConfig[statusKey] || statusConfig.draft;

    const getStatusLabel = (id: string) => statuses.find(s => s.id === id)?.label || id;

    const renderCell = (key: string) => {
        if (!visibilitySettings[key as keyof VisibilitySettings]) return null;

        switch (key) {
            case 'id':
                return (
                    <td key="id" className="px-6 py-4 text-left">
                        <span className="font-mono text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">{order.id?.slice(-8)}</span>
                    </td>
                );
            case 'orderDate':
                return (
                    <td key="orderDate" className="px-6 py-4 text-left">
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{showTrash ? (order.deletedAt || order.date) : order.date}</span>
                            {order.status === 'draft' && isIncomplete && !showTrash && (
                                <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 dark:text-orange-500 bg-orange-50 dark:bg-orange-950/30 px-2 py-0.5 rounded-md w-fit">
                                    Incompleto
                                </span>
                            )}
                        </div>
                    </td>
                );
            case 'deliveryDate':
                const deliveryDateStr = order.shipping?.scheduling?.date;
                let isPastDelivery = false;
                if (deliveryDateStr) {
                    try {
                        const [day, month, year] = deliveryDateStr.split('/').map(Number);
                        const deliveryDate = new Date(year, month - 1, day);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        isPastDelivery = deliveryDate < today;
                    } catch (e) {
                        console.error("Erro ao processar data de entrega:", e);
                    }
                }

                return (
                    <td key="deliveryDate" className="px-6 py-4 text-left">
                        <div className="flex flex-col gap-1.5 relative">
                            <div className="flex flex-col">
                                <span className={`text-sm font-bold ${isPastDelivery && order.status !== 'fulfilled' && order.status !== 'cancelled' ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                    {deliveryDateStr || "-"}
                                </span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest">
                                    {order.shipping?.scheduling?.time || "-"}
                                </span>
                            </div>

                            {isPastDelivery && order.status !== 'fulfilled' && order.status !== 'cancelled' && !showTrash && settings.showManualFulfillmentPrompt && (
                                <>
                                    {!showFulfillmentConfirm ? (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setShowFulfillmentConfirm(true); }}
                                            className="flex items-center gap-1.5 px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-500 rounded-lg border border-red-200 dark:border-red-900/30 w-fit animate-pulse hover:scale-105 transition-all active:scale-95 shadow-sm"
                                            title="A data de entrega passou. Este pedido já foi atendido?"
                                        >
                                            <i className="bi bi-clock-history text-[10px]" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Pedido {getStatusLabel('fulfilled')}?</span>
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-1.5 animate-slide-up">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onStatusUpdate(order.id!, 'fulfilled');
                                                    setShowFulfillmentConfirm(false);
                                                }}
                                                className="px-2 py-1 bg-emerald-600 text-white text-[9px] font-black uppercase rounded-md hover:bg-emerald-700 transition-colors shadow-sm"
                                            >
                                                Sim
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowFulfillmentConfirm(false);
                                                }}
                                                className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[9px] font-black uppercase rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors shadow-sm"
                                            >
                                                Não
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}

                            {order.status === 'fulfilled' && !order.reviewRequested && !showTrash && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAction("sendCustomerReviews", order);
                                    }}
                                    className="flex items-center gap-1.5 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-500 rounded-lg border border-yellow-100 dark:border-yellow-900/30 w-fit animate-pulse hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-all active:scale-95 cursor-pointer shadow-sm"
                                    title="Enviar pedido de avaliação para o Google Maps"
                                >
                                    <i className="bi bi-star-fill text-[10px]" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Enviar Avaliação</span>
                                </button>
                            )}
                        </div>
                    </td>
                );
            case 'customer':
                return (
                    <td key="customer" className="px-6 py-4 text-left">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{order.customerData?.fullName || "Não informado"}</span>
                    </td>
                );
            case 'totalValue':
                return (
                    <td key="totalValue" className="px-6 py-4 text-right">
                        <span className="text-sm font-black text-blue-600 dark:text-blue-400">{formatCurrency(order.paymentsSummary.totalOrderValue || 0)}</span>
                    </td>
                );
            case 'status':
                return (
                    <td key="status" className="px-6 py-4 relative text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowPicker(!showPicker); }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${currentStatus.bg} dark:bg-opacity-10 w-fit mx-auto hover:brightness-95 dark:hover:brightness-125 transition-all active:scale-95`}
                            title="Clique para alterar o status do pedido"
                        >
                            <div className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot} animate-pulse`} />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${currentStatus.text}`}>{currentStatus.label}</span>
                            <i className="bi bi-chevron-down text-[8px] opacity-30 dark:text-slate-100" />
                        </button>

                        {showPicker && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowPicker(false); }} />
                                <div className="absolute top-[calc(100%-8px)] left-1/2 -ml-20 w-40 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl dark:shadow-none p-2 flex flex-col gap-1 z-[100] animate-slide-up">
                                    {Object.keys(statusConfig).map((key) => {
                                        const s = statusConfig[key];
                                        return (
                                            <button
                                                key={key}
                                                onClick={(e) => {
                                                    e.stopPropagation();
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
                );
            case 'modality':
                const isPickup = order.shipping?.deliveryMethod === 'pickup';
                const modalityLabel = isPickup ? settings.modalityLabels.pickup : settings.modalityLabels.delivery;
                return (
                    <td key="modality" className="px-6 py-4 text-left">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${isPickup
                            ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30'
                            : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30'}`}
                        >
                            <i className={`bi ${isPickup ? 'bi-hand-index-thumb-fill' : 'bi-truck'}`} />
                            {modalityLabel}
                        </span>
                    </td>
                );
            case 'manuseio':
                return (
                    <td key="manuseio" className="px-6 py-4 text-left">
                        {order.shipping?.orderType ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                                <i className="bi bi-box-seam-fill" />
                                {order.shipping.orderType}
                            </span>
                        ) : (
                            <span className="text-slate-300 dark:text-slate-700 font-bold">-</span>
                        )}
                    </td>
                );
            case 'actions':
                return (
                    <td key="actions" className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                            {showTrash ? (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onRestore(order.id!); }}
                                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all shadow-sm bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800"
                                        title="Restaurar Pedido"
                                    >
                                        <i className="bi bi-arrow-counterclockwise text-sm" />
                                    </button>

                                    <div className="h-4 w-[1px] bg-slate-100 dark:bg-slate-800 mx-1" />

                                    <button
                                        onClick={(e) => { e.stopPropagation(); onPermanentDelete(order.id!); }}
                                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all shadow-sm bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800"
                                        title="Excluir Permanentemente"
                                    >
                                        <i className="bi bi-trash3-fill text-sm" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onEdit(order); }}
                                                className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all shadow-sm bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800"
                                                title="Editar Pedido"
                                            >
                                                <i className="bi bi-pencil-fill text-sm" />
                                            </button>

                                            <div
                                                className="relative group/menu"
                                                onMouseEnter={() => setShowMenu(true)}
                                                onMouseLeave={() => setShowMenu(false)}
                                            >
                                                <button
                                                    className={`p-2 rounded-xl transition-all border flex items-center justify-center h-9 w-9 shadow-sm ${showMenu ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700' : 'text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'} group-hover/menu:bg-slate-100 dark:group-hover/menu:bg-slate-800 group-hover/menu:border-slate-200 dark:group-hover/menu:border-slate-700 group-hover/menu:text-slate-800 dark:group-hover/menu:text-slate-200`}
                                                    title="Mais ações e opções de envio"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowMenu(!showMenu);
                                                        setShowPicker(false);
                                                    }}
                                                >
                                                    <i className="bi bi-three-dots-vertical" />
                                                </button>

                                                {/* Dropdown Menu - Continuous hover area */}
                                                <div className={`absolute top-full right-0 pt-2 w-48 flex-col z-[100] ${showMenu ? 'flex' : 'hidden md:group-hover/menu:flex'}`}>
                                                    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 flex flex-col gap-1 animate-slide-up">
                                                        {buttons.map((btn) => (
                                                            <button
                                                                key={btn.key}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onAction(btn.key, order);
                                                                    setShowMenu(false);
                                                                }}
                                                                className={`flex items-center gap-3 w-full p-2.5 rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-slate-800 group/item ${btn.color}`}
                                                                title={btn.tooltip}
                                                            >
                                                                <i className={`bi ${btn.icon} text-lg`} />
                                                                <span className="text-[10px] font-black uppercase tracking-widest">{btn.label}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="h-4 w-[1px] bg-slate-100 dark:bg-slate-800 mx-1" />

                                            <button
                                                onClick={(e) => { e.stopPropagation(); onDelete(order.id!); }}
                                                className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all shadow-sm bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800"
                                                title="Mover para Lixeira"
                                            >
                                                <i className="bi bi-trash-fill text-sm" />
                                            </button>
                                        </div>
                                </>
                            )}
                        </div>
                    </td>
                );
            default:
                return null;
        }
    };

    return (
        <tr
            onClick={() => onViewDetails(order)}
            className={`transition-colors group cursor-pointer ${showMenu || showPicker ? 'relative z-50' : ''} ${order.status === 'scheduled' ? 'hover:bg-blue-50/30 dark:hover:bg-blue-900/10' : 'bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'}`}
        >
            {/* Row Checkbox */}
            <td className="p-0 w-12 text-center">
                <label
                    className="flex items-center justify-center w-full h-full cursor-pointer py-4 px-6"
                    onClick={(e) => e.stopPropagation()}
                >
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelection?.()}
                        className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-900 focus:ring-2 dark:bg-slate-800 dark:border-slate-700 cursor-pointer"
                    />
                </label>
            </td>

            {orderedColumnKeys ? orderedColumnKeys.map(key => renderCell(key)) : (
                <>
                    {renderCell('id')}
                    {renderCell('orderDate')}
                    {renderCell('deliveryDate')}
                    {renderCell('customer')}
                    {renderCell('totalValue')}
                    {renderCell('status')}
                    {renderCell('actions')}
                </>
            )}
        </tr>
    );
};

export default OrderHistoryRow;
