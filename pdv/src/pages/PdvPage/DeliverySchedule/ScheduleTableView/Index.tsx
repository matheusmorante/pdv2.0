import React from "react";
import Order from "../../../types/pdvAction.type";
import { stringifyFullAddressWithObservation, stringifyItems } from "../../../utils/fomatters";

interface Props {
    schedule: Record<string, Order[]>;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 to 20:00

// Helper to get integer hour from "HH:mm" string
const getHour = (time?: string) => {
    if (!time) return -1;
    return parseInt(time.split(":")[0], 10);
};

// Helper to calculate non-overlapping lanes for a set of orders in a single day
const calculateLanes = (orders: Order[]): Order[][] => {
    const lanes: Order[][] = [];

    // Sort by start time to process chronologically
    const sortedOrders = [...orders].sort((a, b) => {
        const startA = getHour(a.shipping.scheduling.startTime || a.shipping.scheduling.time);
        const startB = getHour(b.shipping.scheduling.startTime || b.shipping.scheduling.time);
        return startA - startB;
    });

    sortedOrders.forEach((order) => {
        const start = getHour(order.shipping.scheduling.startTime || order.shipping.scheduling.time);
        let placed = false;

        for (const lane of lanes) {
            const lastInLane = lane[lane.length - 1];
            const endHourLast = lastInLane.shipping.scheduling.type === 'range'
                ? getHour(lastInLane.shipping.scheduling.endTime)
                : getHour(lastInLane.shipping.scheduling.startTime || lastInLane.shipping.scheduling.time) + 1;

            // If the last order in this lane ends before or at the start of the current order
            if (endHourLast <= start) {
                lane.push(order);
                placed = true;
                break;
            }
        }

        if (!placed) {
            lanes.push([order]);
        }
    });

    return lanes.length > 0 ? lanes : [[]];
};

const TableCell = ({ order, duration }: { order: Order; duration: number }) => (
    <td
        colSpan={duration}
        className="p-1.5 align-top bg-blue-50/40 border-r border-slate-200"
    >
        <div className="h-full bg-white border-2 border-blue-200 rounded-xl p-3 shadow-sm hover:shadow-md hover:border-blue-400 transition-all group overflow-hidden flex flex-col gap-2">
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

const ScheduleTableView = ({ schedule }: Props) => {
    return (
        <div className="bg-white p-2">
            <div className="overflow-x-auto rounded-3xl border-2 border-slate-100 shadow-2xl shadow-slate-200/50">
                <table className="w-full border-collapse min-w-[1200px]">
                    <thead>
                        <tr className="bg-slate-900 text-white">
                            <th className="p-6 w-40 text-xs font-black uppercase tracking-[0.2em] border-r border-slate-800">
                                Cronograma
                            </th>
                            {HOURS.map((h) => (
                                <th key={h} className="p-4 text-[10px] font-black border-r border-slate-800 last:border-0 opacity-70 tracking-widest">
                                    {String(h).padStart(2, '0')}:00
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {Object.entries(schedule).map(([date, orders]) => {
                            const lanes = calculateLanes(orders);

                            return lanes.map((lane, laneIdx) => {
                                // Keep track of hours already covered by a colSpan in this lane
                                const coveredUntil = { value: -1 };

                                return (
                                    <tr key={`${date}-${laneIdx}`} className="h-32 group hover:bg-slate-50/50 transition-colors">
                                        {/* Date Column - Only render on the first lane of the day */}
                                        {laneIdx === 0 && (
                                            <td
                                                rowSpan={lanes.length}
                                                className="p-6 font-black text-center bg-slate-50/80 border-r-2 border-slate-100 align-middle sticky left-0 z-10"
                                            >
                                                <div className="flex flex-col items-center">
                                                    <span className="text-3xl text-slate-900 tracking-tighter">
                                                        {new Date(date + "T00:00:00").toLocaleDateString("pt-BR", { day: '2-digit' })}
                                                    </span>
                                                    <span className="text-[10px] uppercase text-blue-600 font-black tracking-[0.2em] -mt-1 mb-1">
                                                        {new Date(date + "T00:00:00").toLocaleDateString("pt-BR", { month: 'short' })}
                                                    </span>
                                                    <span className="text-[9px] text-slate-400 uppercase font-black">
                                                        {new Date(date + "T00:00:00").toLocaleDateString("pt-BR", { weekday: 'short' })}
                                                    </span>
                                                </div>
                                            </td>
                                        )}

                                        {/* Hourly Cells */}
                                        {HOURS.map((hour) => {
                                            // Skip if this cell is part of a previous order's span
                                            if (hour < coveredUntil.value) return null;

                                            // Find order in this lane starting at this hour
                                            const order = lane.find(o => getHour(o.shipping.scheduling.startTime || o.shipping.scheduling.time) === hour);

                                            if (order) {
                                                const startHour = getHour(order.shipping.scheduling.startTime || order.shipping.scheduling.time);
                                                const endHour = order.shipping.scheduling.type === 'range'
                                                    ? getHour(order.shipping.scheduling.endTime)
                                                    : startHour + 1;

                                                const duration = Math.max(1, endHour - startHour);
                                                coveredUntil.value = startHour + duration;

                                                return <TableCell key={hour} order={order} duration={duration} />;
                                            }

                                            // Empty cell
                                            return <td key={hour} className="border-r border-slate-50 last:border-0" />;
                                        })}
                                    </tr>
                                );
                            });
                        })}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6 px-4">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-blue-50 border border-blue-200"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Entrega Única</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-blue-600 shadow-sm"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Entrega por Período</span>
                    </div>
                </div>
                <div className="text-[10px] text-slate-300 font-black uppercase tracking-[0.1em]">
                    Visualização Avançada v2.0
                </div>
            </div>
        </div>
    );
};

export default ScheduleTableView;
