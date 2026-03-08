import React from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import Order from "../../../types/pdvAction.type";
import { getSettings } from "../../../utils/settingsService";
import {
    stringifyFullAddressWithObservation,
    stringifyItemsWithValues,
} from "../../../utils/formatters";

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
    const { scheduling } = order.shipping;
    const isRange = scheduling.type === "range";
    const displayTime = isRange
        ? `${scheduling.startTime} - ${scheduling.endTime}`
        : (scheduling.startTime || scheduling.time || "Horário não definido");

    const isPickup = order.shipping?.deliveryMethod === 'pickup';
    const isAssistance = order.orderType === 'assistance';

    let cardColor = 'border-slate-200 dark:border-slate-800 bg-emerald-50/20 dark:bg-emerald-900/5 hover:border-emerald-400 dark:hover:border-emerald-500';
    let draggingColor = 'shadow-emerald-300 dark:shadow-emerald-900/40 ring-emerald-600';
    let headerColor = 'bg-emerald-50/80 dark:bg-emerald-900/10 group-hover:bg-emerald-100/50 dark:group-hover:bg-emerald-900/20';
    let timeColor = 'text-emerald-500 dark:text-emerald-400';
    let labelText = 'Entrega';
    let handleHoverColor = 'hover:text-emerald-600 dark:hover:text-emerald-400';
    let badgeColor = 'bg-emerald-600 dark:bg-emerald-500 text-white';

    if (isAssistance) {
        cardColor = 'border-amber-100 dark:border-amber-900/30 bg-amber-50/20 dark:bg-amber-900/5 hover:border-amber-400 dark:hover:border-amber-500';
        draggingColor = 'shadow-amber-300 dark:shadow-amber-900/40 ring-amber-600';
        headerColor = 'bg-amber-50/80 dark:bg-amber-900/10 group-hover:bg-amber-100/50 dark:group-hover:bg-amber-900/20';
        timeColor = 'text-amber-500 dark:text-amber-400';
        labelText = 'Assistência';
        handleHoverColor = 'hover:text-amber-600 dark:hover:text-amber-400';
        badgeColor = 'bg-amber-600 dark:bg-amber-500 text-white';
    } else if (isPickup) {
        cardColor = 'border-blue-100 dark:border-blue-900/30 bg-blue-50/20 dark:bg-blue-900/5 hover:border-blue-400 dark:hover:border-blue-500';
        draggingColor = 'shadow-blue-300 dark:shadow-blue-900/40 ring-blue-600';
        headerColor = 'bg-blue-50/80 dark:bg-blue-900/10 group-hover:bg-blue-100/50 dark:group-hover:bg-blue-900/20';
        timeColor = 'text-blue-500 dark:text-blue-400';
        labelText = 'Retirada';
        handleHoverColor = 'hover:text-blue-600 dark:hover:text-blue-400';
        badgeColor = 'bg-blue-600 dark:bg-blue-500 text-white';
    }

    return (
        <Draggable draggableId={order.id || `temp-${index}`} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    onClick={() => onOrderClick(order)}
                    className={`group border rounded-2xl shadow-sm overflow-hidden transition-all duration-300 cursor-pointer ${cardColor} ${snapshot.isDragging
                        ? `shadow-2xl scale-[1.05] ring-2 z-50 ring-offset-4 ${draggingColor}`
                        : "hover:-translate-y-1"
                        }`}
                >
                    {/* Card Header: Drag Handle & Time */}
                    <div className={`px-5 py-4 border-b dark:border-slate-800 flex justify-between items-center transition-colors ${headerColor}`}>
                        <div className="flex items-center gap-4">
                            <div
                                {...provided.dragHandleProps}
                                onClick={(e) => e.stopPropagation()}
                                className={`cursor-grab active:cursor-grabbing text-slate-400 dark:text-slate-500 p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-transparent dark:border-slate-700 transition-colors ${handleHoverColor}`}
                                title="Mover pedido"
                            >
                                <i className="bi bi-grip-vertical text-xl" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">
                                    {labelText}
                                </span>
                                <span className="font-black text-sm tracking-tight flex items-center text-slate-800 dark:text-slate-200">
                                    <i className={`bi bi-clock-fill mr-2 ${timeColor}`} />
                                    {displayTime}
                                </span>
                            </div>
                        </div>
                        {isRange && (
                            <span className={`text-[9px] uppercase font-black px-3 py-1 rounded-full tracking-widest shadow-sm ${badgeColor}`}>
                                Período
                            </span>
                        )}
                    </div>

                    {/* Tipo de Pedido & Manuseio Labels */}
                    <div className="flex flex-wrap gap-2 px-5 pt-4">
                        <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-lg border ${order.orderType === 'assistance'
                            ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30'
                            : order.shipping?.deliveryMethod === 'pickup'
                            ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30'
                            : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30'}`}
                        >
                            <i className={`bi ${order.orderType === 'assistance' ? 'bi-tools' : (order.shipping?.deliveryMethod === 'pickup' ? 'bi-hand-index-thumb-fill' : 'bi-truck')} mr-1.5`} />
                            {order.orderType === 'assistance'
                                ? settings.orderTypeLabels.assistance
                                : (order.shipping?.deliveryMethod === 'pickup' ? settings.orderTypeLabels.pickup : settings.orderTypeLabels.delivery)}
                        </span>

                        {order.shipping?.orderType && (
                            <span className="text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                <i className="bi bi-box-seam-fill mr-1.5" />
                                {order.shipping.orderType}
                            </span>
                        )}
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

                        {!isPickup && (
                            <div className="flex items-start gap-3 text-slate-500 dark:text-slate-400 font-bold bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50 transition-colors">
                                <i className="bi bi-geo-alt-fill text-red-500 mt-0.5" />
                                <span className="leading-snug text-xs">
                                    {stringifyFullAddressWithObservation(order.customerData?.fullAddress)}
                                </span>
                            </div>
                        )}

                        <div className="bg-blue-50/30 dark:bg-blue-900/10 p-4 border border-blue-100/50 dark:border-blue-900/30 rounded-xl text-[11px] font-mono text-blue-900 dark:text-blue-200 whitespace-pre-line leading-relaxed group-hover:bg-white dark:group-hover:bg-slate-900 transition-colors">
                            <div className="font-black uppercase tracking-wider mb-2 pb-1 border-b border-blue-100 dark:border-blue-900/50 text-[9px] opacity-60">
                                Itens do Pedido
                            </div>
                            {stringifyItemsWithValues(order.items)}
                        </div>

                        {order.observation && (
                            <div className="text-amber-800 dark:text-amber-200/70 bg-amber-50/50 dark:bg-amber-900/10 p-3 rounded-xl italic text-xs border border-amber-100/50 dark:border-amber-900/30 flex items-start gap-3 transition-colors">
                                <i className="bi bi-info-circle-fill text-amber-500 mt-0.5" />
                                <p className="leading-relaxed">
                                    <strong className="uppercase font-black text-[9px] tracking-widest mr-1">Obs:</strong>
                                    {order.observation}
                                </p>
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
                                    Cronograma Diário
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
