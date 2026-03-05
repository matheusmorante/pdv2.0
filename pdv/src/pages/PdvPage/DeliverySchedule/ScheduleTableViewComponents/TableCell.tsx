import React from "react";
import Order from "../../../types/pdvAction.type";
import { stringifyFullAddressWithObservation, stringifyItems } from "../../../utils/formatters";

interface Props {
    order: Order;
    duration: number;
    onOrderClick: (order: Order) => void;
}

const TableCell = ({ order, duration, onOrderClick }: Props) => (
    <td
        colSpan={duration}
        className="p-1.5 align-top bg-blue-50/40 border-r border-slate-200"
    >
        <div
            onClick={() => onOrderClick(order)}
            className="h-full bg-white border-2 border-blue-200 rounded-xl p-3 shadow-sm hover:shadow-md hover:border-blue-400 transition-all group overflow-hidden flex flex-col gap-2 cursor-pointer"
        >
            <div className="flex justify-between items-start mb-1 pb-1 border-b border-slate-100">
                <span className="font-black text-[9px] text-blue-700 uppercase tracking-widest whitespace-nowrap">
                    {order.shipping.scheduling.startTime || order.shipping.scheduling.time}
                    {order.shipping.scheduling.type === 'range' && ` → ${order.shipping.scheduling.endTime}`}
                </span>
                {order.shipping.scheduling.type === 'range' && (
                    <span className="text-[7px] font-black bg-blue-600 text-white px-1 py-0.5 rounded uppercase tracking-tighter">
                        Período
                    </span>
                )}
            </div>

            <div className="font-black text-slate-800 text-[11px] uppercase truncate leading-none">
                {order.customerData?.fullName || "Consumidor"}
            </div>

            <div
                className="text-[8px] text-slate-400 font-bold leading-snug truncate"
                title={stringifyFullAddressWithObservation(order.customerData?.fullAddress)}
            >
                <i className="bi bi-geo-alt-fill text-red-400 mr-0.5" />
                {stringifyFullAddressWithObservation(order.customerData?.fullAddress)}
            </div>

            <div className="mt-1 bg-slate-50/80 p-1.5 rounded-lg border border-slate-100 group-hover:bg-blue-50/30 transition-colors">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 opacity-60">Itens</p>
                <p className="text-[9px] font-mono text-slate-600 leading-tight line-clamp-2">
                    {stringifyItems(order.items || [])}
                </p>
            </div>
        </div>
    </td>
);

export default TableCell;
