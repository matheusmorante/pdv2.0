import React from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import Order from "../../../types/order.type";
import { getSettings } from "../../../utils/settingsService";
import { stringifyFullAddressWithObservation, formatCurrency } from "../../../utils/formatters";
import { getOrderTypeClasses, resolveOrderColor } from "../../../utils/orderTypeColorUtils";
import { calcItemTotalValue } from "../../../utils/calculations";

interface Props {
    schedule: Record<string, Order[]>;
    handleDragEnd: (result: DropResult) => void;
    onOrderClick: (order: Order) => void;
}

/**
 * Renders an individual delivery order as a draggable card
 */
const DeliveryOrderCard = ({ order, index, onOrderClick }: { order: Order; index: number; onOrderClick: (order: Order) => void }) => {
    const settings = getSettings();
    const isAssistance = order.orderType === 'assistance';
    const isPickup = order.shipping?.deliveryMethod === 'pickup';

    // Assistance orders store time at top level; regular orders use shipping.scheduling
    const scheduling = order.shipping?.scheduling;
    let displayTime = "Horário não definido";
    if (isAssistance) {
        const t = (order as any).scheduledTime;
        displayTime = t || "Horário não definido";
    } else if (scheduling) {
        const isRange = scheduling.type === "range";
        displayTime = isRange
            ? `${scheduling.startTime} - ${scheduling.endTime}`
            : (scheduling.startTime || scheduling.time || "Horário não definido");
    }
    const isRange = scheduling?.type === "range" && !isAssistance;

    const colors = settings.orderTypeColors ?? { delivery: 'green', pickup: 'purple', assistance: 'orange' };
    const colorKey = resolveOrderColor(order.orderType, order.shipping?.deliveryMethod, colors);
    const cls = getOrderTypeClasses(colorKey);

    const typeLabel = isAssistance
        ? settings.orderTypeLabels.assistance
        : (isPickup ? settings.orderTypeLabels.pickup : settings.orderTypeLabels.delivery);

    return (
        <Draggable draggableId={order.id || `temp-${index}`} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    onClick={() => onOrderClick(order)}
                    className={`group border rounded-2xl shadow-sm overflow-hidden transition-all duration-300 cursor-pointer ${cls.cardBg} ${cls.cardBorder} ${snapshot.isDragging
                        ? `shadow-2xl scale-[1.05] ring-2 z-50 ring-offset-4`
                        : "hover:-translate-y-1"
                        }`}
                >
                    {/* Card Header: Drag Handle & Time */}
                    <div className={`px-5 py-4 border-b dark:border-slate-800 flex justify-between items-center transition-colors ${cls.headerBg}`}>
                        <div className="flex items-center gap-4">
                            <div
                                {...provided.dragHandleProps}
                                onClick={(e) => e.stopPropagation()}
                                className={`cursor-grab active:cursor-grabbing text-slate-400 dark:text-slate-500 p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-transparent dark:border-slate-700 transition-colors ${cls.handleHover}`}
                                title="Mover pedido"
                            >
                                <i className="bi bi-grip-vertical text-xl" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">
                                    {typeLabel}
                                </span>
                                <span className="font-black text-sm tracking-tight flex items-center text-slate-800 dark:text-slate-200">
                                    <i className={`bi bi-clock-fill mr-2 ${cls.timeText}`} />
                                    {displayTime}
                                </span>
                            </div>
                        </div>
                        {isRange && (
                            <span className={`text-[9px] uppercase font-black px-3 py-1 rounded-full tracking-widest shadow-sm ${cls.dotBg}`}>
                                Período
                            </span>
                        )}
                    </div>

                    {/* Tipo de Pedido & Manuseio Labels */}
                    <div className="flex flex-wrap gap-2 px-5 pt-4">
                        <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-lg border ${cls.badge}`}>
                            <i className={`bi ${isAssistance ? 'bi-tools' : (isPickup ? 'bi-hand-index-thumb-fill' : 'bi-truck')} mr-1.5`} />
                            {typeLabel}
                        </span>


                    </div>

                    {/* Card Content: Customer & Details */}
                    <div className="p-5 text-sm flex flex-col gap-4 text-left">
                        <div>
                            <span className="text-[10px] uppercase font-black text-slate-300 dark:text-slate-600 tracking-[0.2em] block mb-1">
                                Cliente
                            </span>
                            <div className="font-black text-slate-900 dark:text-slate-100 text-xl leading-tight uppercase tracking-tighter transition-colors">
                                {order.customerData?.fullName || "Consumidor"}
                            </div>
                        </div>

                        {/* Assistance: show description */}
                        {isAssistance && (order as any).assistanceDescription && (
                            <div className="flex items-start gap-3 bg-amber-50/60 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-100 dark:border-amber-900/20">
                                <i className="bi bi-tools text-amber-500 mt-0.5 shrink-0" />
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-snug">
                                    {(order as any).assistanceDescription}
                                </span>
                            </div>
                        )}

                        {!isPickup && !isAssistance && (
                            <div className="flex items-start gap-3 text-slate-500 dark:text-slate-400 font-bold bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50 transition-colors">
                                <i className="bi bi-geo-alt-fill text-red-500 mt-0.5" />
                                <span className="leading-snug text-xs">
                                    {stringifyFullAddressWithObservation(order.customerData?.fullAddress)}
                                </span>
                            </div>
                        )}

                        {(order.items && order.items.length > 0) && (
                        <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
                                <i className="bi bi-box-seam text-[10px] text-slate-400 dark:text-slate-500" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                                    {isAssistance ? 'Peças / Materiais' : 'Lista de Itens'}
                                </span>
                                <span className="ml-auto text-[9px] font-black text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-2 py-0.5">
                                    {order.items?.length ?? 0}
                                </span>
                            </div>
                            {/* Item rows */}
                            <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {(order.items || []).map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                        {/* Qty badge */}
                                        <span className={`flex-shrink-0 min-w-[2rem] text-center text-[10px] font-black px-1.5 py-0.5 rounded-md ${cls.dotBg}`}>
                                            {item.quantity} Un
                                        </span>
                                        {/* Description */}
                                        <div className="flex-1 flex flex-col">
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-snug">
                                                {item.description}
                                                {(item as any).supplierName && ` - ${(item as any).supplierName}`}
                                            </span>
                                            {item.handlingType && (
                                                <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 dark:text-blue-400 mt-0.5">
                                                    {item.handlingType}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        )}

                        {order.observation && (
                            <div className="text-amber-800 dark:text-amber-200/70 bg-amber-50/50 dark:bg-amber-900/10 p-3 rounded-xl text-xs border border-amber-100/50 dark:border-amber-900/30 flex items-start gap-3 transition-colors">
                                <i className="bi bi-info-circle-fill text-amber-500 mt-0.5" />
                                <div className="flex flex-col gap-1.5 w-full">
                                    <strong className="uppercase font-black text-[9px] tracking-widest text-amber-600 dark:text-amber-500">Observações:</strong>
                                    <div className="flex flex-wrap gap-1.5 w-full">
                                        {order.observation.split(';').filter((t: string) => t.trim() !== "").map((tag: string, i: number) => (
                                            <span key={i} className="px-2 py-0.5 bg-amber-100/50 dark:bg-amber-900/40 text-[10px] font-bold rounded-lg border border-amber-200/50 dark:border-amber-800/50 text-amber-800 dark:text-amber-200 capitalize">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Draggable>
    );
};

/**
 * Main component for the Card Visualization of the Delivery Schedule
 */
const ScheduleCardView = ({ schedule, handleDragEnd, onOrderClick }: Props) => {
    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex flex-col gap-12 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
                {Object.entries(schedule).map(([date, orders]) => (
                    <div key={date} className="w-full">
                        {/* Date Divider */}
                        <div className="flex items-center gap-6 mb-8">
                            <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent to-slate-200 dark:to-slate-800"></div>
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 dark:text-slate-600 mb-2">
                                    Cronograma Logístico
                                </span>
                                <h3 className="text-sm font-black uppercase text-blue-600 dark:text-blue-400 tracking-widest bg-blue-50 dark:bg-blue-900/20 px-6 py-2 rounded-2xl border-2 border-blue-100 dark:border-blue-900/30 shadow-sm shadow-blue-50 dark:shadow-none transition-colors">
                                    {new Date(date + "T00:00:00").toLocaleDateString("pt-BR", {
                                        weekday: 'long',
                                        day: '2-digit',
                                        month: 'long'
                                    })}
                                </h3>
                            </div>
                            <div className="h-0.5 flex-1 bg-gradient-to-l from-transparent to-slate-200 dark:to-slate-800"></div>
                        </div>

                        <Droppable droppableId={date}>
                            {(provided) => (
                                <div
                                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    {orders.map((order, index) => (
                                        <DeliveryOrderCard
                                            key={order.id || `order-${index}`}
                                            order={order}
                                            index={index}
                                            onOrderClick={onOrderClick}
                                        />
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}
            </div>
        </DragDropContext>
    );
};


export default ScheduleCardView;
