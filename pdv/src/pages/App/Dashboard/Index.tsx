import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { StatsCard } from './components/StatsCard';
import { ChartContainer, SimpleAreaChart, SimplePieChart } from './components/DashboardCharts';
import { useDashboardData, Period } from './useDashboardData';

interface VisibilityConfig {
    stats: boolean;
    revenueChart: boolean;
    statusChart: boolean;
    reports: boolean;
    quickAction: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const PERIODS: { label: string, value: Period }[] = [
    { label: 'Personalizado', value: 'custom' },
    { label: 'Semana', value: 'week' },
    { label: 'Mês', value: 'month' },
    { label: 'Semestre', value: 'semester' },
    { label: 'Ano', value: 'year' },
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
    const { loading, stats, salesOverTime, statusData } = useDashboardData(period, customStartDate, customEndDate);
    const [showConfig, setShowConfig] = useState(false);

    const [visibility, setVisibility] = useState<VisibilityConfig>(() => {
        const saved = localStorage.getItem('dashboard_visibility');
        return saved ? JSON.parse(saved) : {
            stats: true,
            revenueChart: true,
            statusChart: true,
            reports: true,
            quickAction: true
        };
    });

    useEffect(() => {
        localStorage.setItem('dashboard_visibility', JSON.stringify(visibility));
    }, [visibility]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="relative w-16 h-16">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-100 dark:border-slate-800 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
            </div>
        );
    }

    const todayStr = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 animate-slide-up px-2 md:px-0">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl xl:text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">
                            Dash<span className="text-blue-600">board</span>
                        </h1>
                        
                        <div className="hidden sm:flex px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-[9px] font-black uppercase tracking-widest items-center gap-1.5 cursor-help" title="Métricas baseadas em pedidos Agendados e Atendidos. Rascunhos e Cancelados não contabilizam.">
                            <i className="bi bi-info-circle-fill"></i>
                            Venda: Agendado/Atendido
                        </div>

                        <div className="relative">
                            <button 
                                onClick={() => setShowConfig(!showConfig)}
                                className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
                            >
                                <i className="bi bi-gear-fill text-lg"></i>
                            </button>
                            
                            {showConfig && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowConfig(false)}></div>
                                    <div className="absolute top-full mt-3 left-0 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 z-50 animate-slide-up">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Visibilidade</h4>
                                        <div className="space-y-4">
                                            {Object.entries(visibility).map(([key, val]) => (
                                                <button 
                                                    key={key}
                                                    onClick={() => setVisibility(v => ({ ...v, [key as keyof VisibilityConfig]: !val }))}
                                                    className="flex items-center justify-between w-full group"
                                                >
                                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 capitalize">
                                                        {key === 'revenueChart' ? 'Receita' : 
                                                         key === 'statusChart' ? 'Status' : 
                                                         key === 'quickAction' ? 'Ação Rápida' : 
                                                         key === 'reports' ? 'Relatórios' : 'Métricas'}
                                                    </span>
                                                    <div className={`w-10 h-6 rounded-full p-1 transition-all ${val ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                                        <div className={`w-4 h-4 bg-white rounded-full transition-all ${val ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm xl:text-lg">
                        Acompanhe o desempenho das suas vendas em tempo real.
                    </p>
                </div>
                
                <div className="flex flex-col items-end gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                        {period === 'custom' && (
                            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm animate-fade-in">
                                <input
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    className="px-3 py-1.5 text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 bg-transparent outline-none cursor-pointer"
                                />
                                <span className="text-slate-300 dark:text-slate-600 font-bold">-</span>
                                <input
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    className="px-3 py-1.5 text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 bg-transparent outline-none cursor-pointer"
                                />
                            </div>
                        )}
                        <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-1">
                            {PERIODS.map((p) => (
                                <button
                                    key={p.value}
                                    onClick={() => setPeriod(p.value)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === p.value ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="px-5 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest group w-fit">
                        <i className="bi bi-calendar3 text-blue-500 group-hover:rotate-12 transition-transform"></i>
                        {todayStr}
                    </div>
                </div>
            </div>

            {/* Metrics */}
            {visibility.stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    <StatsCard 
                        title="Faturamento" value={formatCurrency(stats.totalSales)} icon="currency-dollar"
                        trend={period !== 'today' ? 'up' : undefined} trendValue="12.5%" color="bg-blue-600"
                    />
                    <StatsCard title="Pedidos" value={stats.orderCount} icon="bag-check-fill" color="bg-emerald-600" />
                    <StatsCard title="Ticket Médio" value={formatCurrency(stats.avgTicket)} icon="graph-up-arrow" color="bg-amber-600" />
                    <StatsCard title="Pendentes" value={stats.pendingOrders} icon="clock-history" color="bg-rose-600" />
                </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {visibility.revenueChart && (
                    <div className="lg:col-span-2">
                        <ChartContainer title="Evolução de Faturamento" subtitle={`Vendas por dia no período (${period})`}>
                            <SimpleAreaChart data={salesOverTime} />
                        </ChartContainer>
                    </div>
                )}

                {visibility.statusChart && (
                    <div className={visibility.revenueChart ? "lg:col-span-1" : "lg:col-span-3"}>
                        <ChartContainer title="Status de Pedidos" subtitle="Composição atual da base">
                            <div className="flex flex-col h-full">
                                <div className="flex-1 w-full relative flex items-center justify-center">
                                    <SimplePieChart data={statusData} />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{stats.orderCount}</span>
                                        <span className="text-[10px] font-black uppercase text-slate-400">Total</span>
                                    </div>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-2">
                                    {statusData.map((item, index) => (
                                        <div key={`status-${index}-${item.name}`} className="flex justify-between items-center px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{item.name}</span>
                                            </div>
                                            <span className="text-xs font-black text-slate-800 dark:text-slate-100">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </ChartContainer>
                    </div>
                )}
            </div>

            {/* Bottom Actions */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pb-10">
                {visibility.reports && (
                    <div className="xl:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
                        <div className="w-full md:w-1/3 text-center md:text-left">
                            <h4 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2">Relatórios Detalhes</h4>
                            <p className="text-sm text-slate-500 mb-6">Analise transações e gere documentos instantaneamente.</p>
                            <button className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors w-full">
                                Ver Relatórios
                            </button>
                        </div>
                        <div className="w-full md:w-2/3 h-full flex items-end gap-2 px-4">
                            {salesOverTime.slice(-12).map((d, i) => {
                                const maxVal = Math.max(...salesOverTime.map(x => x.valor), 1);
                                const h = (d.valor / maxVal) * 100;
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                        <div className="w-full bg-blue-500/10 dark:bg-blue-500/5 rounded-t-lg relative overflow-hidden" style={{ height: '120px' }}>
                                            <div className="absolute bottom-0 left-0 w-full bg-blue-600 rounded-t-lg transition-all duration-500 group-hover:bg-blue-50" style={{ height: `${h}%` }}></div>
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-400">{d.name}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {visibility.quickAction && (
                    <div className={visibility.reports ? "lg:col-span-1" : "lg:col-span-3"}>
                        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-10 rounded-3xl text-white overflow-hidden relative group shadow-xl h-full flex flex-col justify-between">
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                                    <i className="bi bi-box-seam text-2xl text-white"></i>
                                </div>
                                <h3 className="text-2xl font-black mb-3">Novo Pedido</h3>
                                <p className="text-blue-100 text-sm font-medium opacity-80 leading-relaxed mb-8">
                                    Próximo cliente aguardando?<br/>Crie um novo pedido agora.
                                </p>
                            </div>
                            <button 
                                onClick={() => window.location.href = '/sales-order'}
                                className="relative z-10 w-full bg-white text-blue-700 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl"
                            >
                                Iniciar Venda
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
