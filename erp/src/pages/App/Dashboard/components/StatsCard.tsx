import React from 'react';

export interface DashboardStat {
    title: string;
    value: string | number;
    icon: string;
    trend?: 'up' | 'down';
    trendValue?: string;
    color: string;
}

export const StatsCard = ({ title, value, icon, trend, trendValue, color }: DashboardStat) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 group">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-4 rounded-2xl ${color} bg-opacity-10 transition-transform group-hover:scale-110 duration-300 flex items-center justify-center`}>
                <i className={`bi bi-${icon} text-2xl ${color.replace('bg-', 'text-')}`}></i>
            </div>
            {trend && trendValue && (
                <div className={`flex items-center gap-1 text-[10px] font-black px-3 py-1.5 rounded-xl ${trend === 'up' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-rose-600 bg-rose-50 dark:bg-rose-900/20'}`}>
                    <i className={`bi bi-graph-${trend} mr-1`}></i>
                    {trendValue}
                </div>
            )}
        </div>
        <div>
            <p className="text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] mb-1">{title}</p>
            <h3 className="text-2xl xl:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">{value}</h3>
        </div>
    </div>
);
