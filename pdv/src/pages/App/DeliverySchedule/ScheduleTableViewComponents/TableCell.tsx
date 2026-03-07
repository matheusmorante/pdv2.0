import React from "react";
import Order from "../../../types/pdvAction.type";
import { stringifyFullAddressWithObservation, stringifyItems } from "../../../utils/formatters";
import { getSettings } from "../../../utils/settingsService";

interface Props {
    order: Order;
    duration: number;
    onOrderClick: (order: Order) => void;
}

const TableCell = ({ order, duration, onOrderClick }: Props) => {
    const settings = getSettings();

    return (
        <td
            colSpan={duration}
            className="p-1.5 align-top bg-blue-50/40 dark:bg-blue-900/10 border-r border-slate-200 dark:border-slate-800 transition-colors duration-300"
        >
            <div
                onClick={() => onOrderClick(order)}
                className="h-full bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-900/30 rounded-xl p-3 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all group overflow-hidden flex flex-col gap-2 cursor-pointer"
            >
                <div className="flex justify-between items-start mb-1 pb-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-black text-[9px] text-blue-700 dark:text-blue-400 uppercase tracking-widest whitespace-nowrap">
                        {order.shipping.scheduling.startTime || order.shipping.scheduling.time}
                        {order.shipping.scheduling.type === 'range' && ` → ${order.shipping.scheduling.endTime}`}
                    </span>
                    {order.shipping.scheduling.type === 'range' && (
                        <span className="text-[7px] font-black bg-blue-600 text-white px-1 py-0.5 rounded uppercase tracking-tighter">
                            Período
                        </span>
                    )}
                </div>

                <div className="font-black text-slate-800 dark:text-slate-100 text-[11px] uppercase truncate leading-none">
                    {order.customerData?.fullName || "Consumidor"}
                </div>

                <div
                    className="text-[8px] text-slate-400 dark:text-slate-500 font-bold leading-snug truncate"
                    title={stringifyFullAddressWithObservation(order.customerData?.fullAddress)}
                >
                    <i className="bi bi-geo-alt-fill text-red-400 mr-0.5" />
                    {stringifyFullAddressWithObservation(order.customerData?.fullAddress)}
                </div>

                <div className="flex flex-wrap gap-1.5 mt-1">
                    <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${order.shipping?.deliveryMethod === 'pickup'
                        ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100/50 dark:border-amber-900/10'
                        : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100/50 dark:border-indigo-900/10'}`}
                    >
                        {order.shipping?.deliveryMethod === 'pickup' ? settings.modalityLabels.pickup : settings.modalityLabels.delivery}
                    </span>

                    {order.shipping?.orderType && (
                        <span className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 max-w-[100px] truncate">
                            {order.shipping.orderType}
                        </span>
                    )}
                </div>

                <div className="mt-1 bg-slate-50/80 dark:bg-slate-800/50 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 group-hover:bg-blue-50/30 dark:group-hover:bg-blue-900/20 transition-colors">
                    <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 opacity-60">Itens</p>
                    <p className="text-[9px] font-mono text-slate-600 dark:text-slate-400 leading-tight line-clamp-2">
                        {stringifyItems(order.items || [])}
                    </p>
                </div>
            </div>
        </td>
    );
};

export default TableCell;
