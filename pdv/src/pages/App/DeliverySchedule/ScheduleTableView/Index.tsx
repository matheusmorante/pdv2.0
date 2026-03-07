import React, { useRef } from "react";
import Order from "../../../types/pdvAction.type";
import TableCell from "../ScheduleTableViewComponents/TableCell";
import { calculateLanes, getHour } from "../ScheduleTableViewComponents/laneUtils";
import { getSettings } from "../../../utils/settingsService";
import { useAutoScroll } from "../../../utils/useAutoScroll";

interface Props {
    schedule: Record<string, Order[]>;
    onOrderClick: (order: Order) => void;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 to 20:00

const ScheduleTableView = ({ schedule, onOrderClick }: Props) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const settings = getSettings();

    useAutoScroll(containerRef, {
        direction: 'horizontal',
        threshold: settings.autoScroll.threshold,
        maxSpeed: settings.autoScroll.speed,
        enabled: settings.autoScroll.scheduleTable
    });

    return (
        <div className="bg-white dark:bg-slate-950 p-2 transition-colors duration-300">
            <div ref={containerRef} className="overflow-x-auto rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none custom-scrollbar">
                <table className="w-full border-collapse min-w-[1200px]">
                    <thead>
                        <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                            <th className="p-6 w-40 text-xs font-black uppercase tracking-[0.2em] border-r border-slate-800 dark:border-slate-900">
                                Cronograma
                            </th>
                            {HOURS.map((h) => (
                                <th key={h} className="p-4 text-[10px] font-black border-r border-slate-800 dark:border-slate-900 last:border-0 opacity-70 tracking-widest">
                                    {String(h).padStart(2, '0')}:00
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {Object.entries(schedule).map(([date, orders]) => {
                            const lanes = calculateLanes(orders);

                            return lanes.map((lane: Order[], laneIdx: number) => {
                                // Keep track of hours already covered by a colSpan in this lane
                                const coveredUntil = { value: -1 };

                                return (
                                    <tr key={`${date}-${laneIdx}`} className="h-32 group hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                                        {/* Date Column - Only render on the first lane of the day */}
                                        {laneIdx === 0 && (
                                            <td
                                                rowSpan={lanes.length}
                                                className="p-6 font-black text-center bg-slate-50/80 dark:bg-slate-900/80 border-r-2 border-slate-100 dark:border-slate-800 align-middle sticky left-0 z-10"
                                            >
                                                <div className="flex flex-col items-center">
                                                    <span className="text-3xl text-slate-900 dark:text-slate-100 tracking-tighter transition-colors">
                                                        {new Date(date + "T00:00:00").toLocaleDateString("pt-BR", { day: '2-digit' })}
                                                    </span>
                                                    <span className="text-[10px] uppercase text-blue-600 dark:text-blue-400 font-black tracking-[0.2em] -mt-1 mb-1">
                                                        {new Date(date + "T00:00:00").toLocaleDateString("pt-BR", { month: 'short' })}
                                                    </span>
                                                    <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black">
                                                        {new Date(date + "T00:00:00").toLocaleDateString("pt-BR", { weekday: 'short' })}
                                                    </span>
                                                </div>
                                            </td>
                                        )}

                                        {/* Hourly Cells */}
                                        {HOURS.map((hour) => {
                                            if (hour < coveredUntil.value) return null;

                                            const order = lane.find((o: Order) => getHour(o.shipping.scheduling.startTime || o.shipping.scheduling.time) === hour);

                                            if (order) {
                                                const startHour = getHour(order.shipping.scheduling.startTime || order.shipping.scheduling.time);
                                                const endHour = order.shipping.scheduling.type === 'range'
                                                    ? getHour(order.shipping.scheduling.endTime)
                                                    : startHour + 1;

                                                const duration = Math.max(1, endHour - startHour);
                                                coveredUntil.value = startHour + duration;

                                                return <TableCell key={hour} order={order} duration={duration} onOrderClick={onOrderClick} />;
                                            }

                                            return <td key={hour} className="border-r border-slate-50 dark:border-slate-900 last:border-0" />;
                                        })}
                                    </tr>
                                );
                            });
                        })}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-6 px-4">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Entrega Única</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-blue-600 shadow-sm shadow-blue-200 dark:shadow-none"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Entrega por Período</span>
                    </div>
                </div>
                <div className="text-[10px] text-slate-300 dark:text-slate-700 font-black uppercase tracking-[0.1em]">
                    Visualização Avançada v2.0
                </div>
            </div>
        </div>
    );
};

export default ScheduleTableView;
