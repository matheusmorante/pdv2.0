import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { StatsCard } from './components/StatsCard';
import { ChartContainer, SimpleAreaChart, SimplePieChart } from './components/DashboardCharts';
import { useDashboardData, Period } from './useDashboardData';
import AlertsPanel from './components/AlertsPanel';
import ProfitHeatMap from './components/ProfitHeatMap';
import { runDraftCleanup } from '../../utils/draftCleanupService';

interface VisibilityConfig {
    stats: boolean;
    revenueChart: boolean;
    statusChart: boolean;
    reports: boolean;
    quickAction: boolean;
    heatmap: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const PERIODS: { label: string, value: Period }[] = [
    { label: 'Semana', value: 'week' },
    { label: 'Este Mês', value: 'month' },
    { label: 'Últimos 30 Dias', value: 'last_30_days' },
    { label: 'Ano', value: 'year' },
    { label: 'Personalizado', value: 'custom' },
];

export default function Dashboard() {
    const [period, setPeriod] = useState<Period>('week');
    const [customStartDate, setCustomStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d.toISOString().split('T')[0];
    });
    const [customEndDate, setCustomEndDate] = useState(() => {
        const d = new Date();
        return d.toISOString().split('T')[0];
    });
    
    const { loading, stats, prevStats, salesOverTime, statusData, filteredOrders } = useDashboardData(period, customStartDate, customEndDate);
    const [showConfig, setShowConfig] = useState(false);

    const [visibility, setVisibility] = useState<VisibilityConfig>(() => {
        const defaults = {
            stats: true,
            revenueChart: true,
            statusChart: true,
            reports: true,
            quickAction: true,
            heatmap: true
        };
        try {
            const saved = localStorage.getItem('dashboard_visibility');
            if (!saved) return defaults;
            const parsed = JSON.parse(saved);
            return { ...defaults, ...parsed };
        } catch (e) {
            return defaults;
        }
    });

    useEffect(() => {
        localStorage.setItem('dashboard_visibility', JSON.stringify(visibility));
    }, [visibility]);

    useEffect(() => {
        runDraftCleanup();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-[6px] border-slate-50 dark:border-slate-800 rounded-full"></div>
                    <div className="absolute inset-0 border-[6px] border-blue-600 dark:border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
            </div>
        );
    }

    const calculateTrend = (curr: number, prev: number) => {
        if (!prev || prev === 0) return { trend: undefined, value: undefined };
        const diff = ((curr - prev) / prev) * 100;
        return {
            trend: diff >= 0 ? 'up' as const : 'down' as const,
            value: `${Math.abs(diff).toFixed(1)}%`
        };
    };

    const trends = {
        sales: calculateTrend(stats.totalSales, prevStats.totalSales),
        profit: calculateTrend(stats.totalProfit, prevStats.totalProfit),
        count: calculateTrend(stats.saleCount, prevStats.saleCount),
        ticket: calculateTrend(stats.avgTicket, prevStats.avgTicket),
    };

    const todayStr = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

    return (
        <div className="max-w-[1700px] mx-auto space-y-8 animate-fade-in px-4 py-8">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200 dark:shadow-blue-900/20">
                            <i className="bi bi-speedometer2 text-white text-2xl"></i>
                        </div>
                        <h1 className="text-3xl xl:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                            Dash<span className="text-blue-600">board</span>
                        </h1>
                        <button
                            onClick={() => setShowConfig(!showConfig)}
                            className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-blue-600 transition-all hover:rotate-90"
                        >
                            <i className="bi bi-gear-fill text-lg"></i>
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    {period === 'custom' && (
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm animate-fade-in">
                            <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="px-3 py-1 text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 bg-transparent" />
                            <span className="text-slate-300">-</span>
                            <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="px-3 py-1 text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 bg-transparent" />
                        </div>
                    )}
                    <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl flex items-center gap-1 w-full sm:w-auto overflow-x-auto no-scrollbar">
                        {PERIODS.map((p) => (
                            <button
                                key={p.value}
                                onClick={() => setPeriod(p.value)}
                                className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === p.value ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                    <div className="px-5 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3 text-slate-500 font-black text-[10px] uppercase tracking-widest">
                        <i className="bi bi-calendar3 text-blue-500"></i>
                        {todayStr}
                    </div>
                </div>
            </div>

            {/* Metrics */}
            {visibility.stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-6">
                    <StatsCard
                        title="Faturamento" value={formatCurrency(stats.totalSales)} icon="currency-dollar"
                        trend={trends.sales.trend} trendValue={trends.sales.value} color="bg-blue-600"
                    />
                    <StatsCard 
                        title="Lucro Estimado" value={formatCurrency(stats.totalProfit)} icon="graph-up-arrow" 
                        trend={trends.profit.trend} trendValue={trends.profit.value} color="bg-indigo-600" 
                    />
                    <StatsCard 
                        title="Vendas" value={stats.saleCount} icon="cart-check-fill" 
                        trend={trends.count.trend} trendValue={trends.count.value} color="bg-emerald-600" 
                    />
                    <StatsCard title="Ticket Médio" value={formatCurrency(stats.avgTicket)} icon="wallet2" trend={trends.ticket.trend} trendValue={trends.ticket.value} color="bg-violet-600" />
                    <StatsCard title="Pedidos" value={stats.totalOrdersCount} icon="bag-plus-fill" color="bg-amber-600" />
                    <StatsCard title="Pendentes" value={stats.pendingOrders} icon="clock-history" color="bg-rose-600" />
                </div>
            )}

            {/* Central Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {visibility.revenueChart && (
                    <div className="lg:col-span-2">
                        <ChartContainer title="Evolução de Faturamento" subtitle={`Desempenho no período atual (${period})`}>
                            <SimpleAreaChart data={salesOverTime} />
                        </ChartContainer>
                    </div>
                )}
                <AlertsPanel maxItems={6} />
            </div>

            {/* Heatmap Section */}
            {visibility.heatmap && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Radar Geográfico de Lucro</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Concentração de vendas por bairro</p>
                        </div>
                    </div>
                    <ProfitHeatMap orders={filteredOrders} />
                </div>
            )}

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pb-10">
                {visibility.statusChart && (
                    <ChartContainer title="Mix de Status" subtitle="Distribuição dos pedidos">
                        <div className="relative h-64 flex items-center justify-center">
                            <SimplePieChart data={statusData} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{stats.totalOrdersCount}</span>
                                <span className="text-[10px] font-black uppercase text-slate-400">Total</span>
                            </div>
                        </div>
                    </ChartContainer>
                )}

                {visibility.reports && (
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 flex flex-col justify-between shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h4 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2">Relatórios Detalhes</h4>
                                <p className="text-sm text-slate-400 font-medium">Análise de fluxo e geração de documentos.</p>
                            </div>
                            <button className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-blue-600 transition-colors">
                                <i className="bi bi-file-earmark-bar-graph text-xl"></i>
                            </button>
                        </div>
                        <div className="h-32 flex items-end gap-2 px-2">
                            {salesOverTime.slice(-15).map((d, i) => {
                                const maxVal = Math.max(...salesOverTime.map(x => x.valor), 1);
                                const h = (d.valor / maxVal) * 100;
                                return (
                                    <div key={i} className="flex-1 bg-blue-500/10 dark:bg-blue-500/5 rounded-t-xl relative group">
                                        <div className="absolute bottom-0 left-0 w-full bg-blue-600/80 rounded-t-xl transition-all duration-500 group-hover:bg-blue-500" style={{ height: `${Math.max(h, 5)}%` }}></div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {visibility.quickAction && (
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-between relative overflow-hidden group">
                        <i className="bi bi-rocket-takeoff absolute -right-4 -bottom-4 text-9xl text-white/10 -rotate-12 group-hover:scale-110 transition-transform duration-700"></i>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black mb-2">Nova Venda</h3>
                            <p className="text-blue-100 text-sm font-medium opacity-80 leading-relaxed">Inicie um novo pedido agora e agilize seu atendimento.</p>
                        </div>
                        <button
                            onClick={() => window.location.href = '/sales-order'}
                            className="relative z-10 w-full bg-white text-blue-700 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-2xl transition-all active:scale-95"
                        >
                            Começar
                        </button>
                    </div>
                )}
            </div>

            {/* Config Overlay Modal could be added here if needed */}
        </div>
    );
}
