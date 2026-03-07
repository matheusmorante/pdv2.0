import React, { useState, useEffect, useMemo } from 'react';
import { subscribeToOrders } from '../../utils/orderHistoryService';
import Order from '../../types/order.type';
import { formatCurrency } from '../../utils/formatters';

// --- Types ---

type Period = 'today' | 'week' | 'month' | 'year' | 'max';

interface VisibilityConfig {
    stats: boolean;
    revenueChart: boolean;
    statusChart: boolean;
    reports: boolean;
    quickAction: boolean;
}

interface DashboardStat {
    title: string;
    value: string | number;
    icon: string;
    trend?: 'up' | 'down';
    trendValue?: string;
    color: string;
}

interface ChartData {
    name: string;
    valor: number;
}

interface StatusDistribution {
    name: string;
    value: number;
}

// --- Sub-components (Vanilla SVG Charts) ---

const StatsCard = ({ title, value, icon, trend, trendValue, color }: DashboardStat) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 group">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-4 rounded-2xl ${color} bg-opacity-10 transition-transform group-hover:scale-110 duration-300 flex items-center justify-center`}>
                <i className={`bi bi-${icon} text-2xl ${color.replace('bg-', 'text-')}`}></i>
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-rose-600 bg-rose-50 dark:bg-rose-900/20'}`}>
                    <i className={`bi bi-arrow-${trend}-${trend === 'up' ? 'right' : 'right'} text-[10px]`}></i>
                    {trendValue}
                </div>
            )}
        </div>
        <div>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">{title}</p>
            <h3 className="text-2xl xl:text-3xl font-black text-slate-800 dark:text-slate-100">{value}</h3>
        </div>
    </div>
);

const ChartContainer = ({ title, subtitle, children }: { title: string, subtitle?: string, children: React.ReactNode }) => (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
        <div className="mb-8">
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{title}</h3>
            {subtitle && <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">{subtitle}</p>}
        </div>
        <div className="h-[250px] w-full relative">
            {children}
        </div>
    </div>
);

const SimpleAreaChart = ({ data }: { data: ChartData[] }) => {
    if (data.length === 0) return <div className="flex items-center justify-center h-full text-slate-400 font-bold uppercase text-xs tracking-widest">Sem dados no período</div>;
    const maxVal = Math.max(...data.map(d => d.valor), 1);
    const width = 1000;
    const height = 250;
    const points = data.map((d, i) => ({
        x: (i / Math.max(data.length - 1, 1)) * width,
        y: height - (d.valor / maxVal) * (height * 0.8) - 20
    }));

    const pathData = `M ${points[0].x},${height} ` + 
        points.map(p => `L ${p.x},${p.y}`).join(' ') + 
        ` L ${points[points.length-1].x},${height} Z`;

    const lineData = points.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(' ');

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
            </defs>
            {[0, 0.25, 0.5, 0.75, 1].map(v => (
                <line key={v} x1="0" y1={height * v} x2={width} y2={height * v} stroke="#e2e8f0" strokeDasharray="4 4" />
            ))}
            <path d={pathData} fill="url(#areaGradient)" />
            <path d={lineData} fill="none" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((p, i) => (
                <g key={i}>
                    <circle cx={p.x} cy={p.y} r="8" fill="#3b82f6" stroke="#fff" strokeWidth="4" />
                    <text x={p.x} y={height + 25} textAnchor="middle" className="text-[24px] font-bold fill-slate-400 uppercase tracking-widest">
                        {data[i].name}
                    </text>
                </g>
            ))}
        </svg>
    );
};

const SimplePieChart = ({ data }: { data: StatusDistribution[] }) => {
    if (data.length === 0) return <div className="flex items-center justify-center h-full text-slate-400 font-bold uppercase text-xs tracking-widest">Sem dados</div>;
    const total = data.reduce((acc, d) => acc + d.value, 0);
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    let currentAngle = 0;

    return (
        <svg viewBox="0 0 100 100" className="w-full h-full max-h-[200px] -rotate-90">
            {data.map((d, i) => {
                const angle = (d.value / total) * 360;
                const r = 40;
                const x1 = 50 + r * Math.cos((currentAngle * Math.PI) / 180);
                const y1 = 50 + r * Math.sin((currentAngle * Math.PI) / 180);
                const x2 = 50 + r * Math.cos(((currentAngle + angle) * Math.PI) / 180);
                const y2 = 50 + r * Math.sin(((currentAngle + angle) * Math.PI) / 180);
                
                const path = `M 50 50 L ${x1} ${y1} A ${r} ${r} 0 ${angle > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;
                currentAngle += angle;
                
                return <path key={i} d={path} fill={colors[i % colors.length]} stroke="#fff" strokeWidth="1" />;
            })}
            <circle cx="50" cy="50" r="30" fill="#fff" className="dark:fill-slate-900" />
        </svg>
    );
};

// --- Utils ---

const parsePTBRDate = (dateStr: string): Date | null => {
    try {
        const [date, time] = dateStr.split(', ');
        const [d, m, y] = date.split('/').map(Number);
        return new Date(y, m - 1, d);
    } catch {
        return null;
    }
};

const isSameDay = (d1: Date, d2: Date) => 
    d1.getDate() === d2.getDate() && 
    d1.getMonth() === d2.getMonth() && 
    d1.getFullYear() === d2.getFullYear();

// --- Constants ---

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const STATUS_LABELS: Record<string, string> = {
    draft: 'Rascunho',
    scheduled: 'Agendado',
    fulfilled: 'Atendido',
    cancelled: 'Cancelado'
};

const PERIODS: { label: string, value: Period }[] = [
    { label: 'Hoje', value: 'today' },
    { label: 'Semana', value: 'week' },
    { label: 'Mês', value: 'month' },
    { label: 'Ano', value: 'year' },
    { label: 'Máximo', value: 'max' },
];

// --- Main Dashboard Component ---

export default function Dashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<Period>('week');
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

    useEffect(() => {
        const unsubscribe = subscribeToOrders((fetchedOrders: Order[]) => {
            setOrders(fetchedOrders);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredOrders = useMemo(() => {
        const active = orders.filter(o => !o.deleted);
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return active.filter(o => {
            const oDate = o.date ? parsePTBRDate(o.date) : null;
            if (!oDate) return false;

            switch (period) {
                case 'today': return isSameDay(oDate, now);
                case 'week': {
                    const diff = now.getTime() - oDate.getTime();
                    return diff <= 7 * 24 * 60 * 60 * 1000;
                }
                case 'month': return oDate.getMonth() === now.getMonth() && oDate.getFullYear() === now.getFullYear();
                case 'year': return oDate.getFullYear() === now.getFullYear();
                case 'max': return true;
                default: return true;
            }
        });
    }, [orders, period]);

    const stats = useMemo(() => {
        const totalSales = filteredOrders.reduce((acc, curr) => acc + (curr.paymentsSummary?.totalOrderValue || 0), 0);
        const avgTicket = filteredOrders.length > 0 ? totalSales / filteredOrders.length : 0;
        const pendingOrders = filteredOrders.filter(o => o.status === 'scheduled' || o.status === 'draft').length;

        return {
            totalSales,
            orderCount: filteredOrders.length,
            avgTicket,
            pendingOrders
        };
    }, [filteredOrders]);

    const salesOverTime = useMemo((): ChartData[] => {
        const days = period === 'max' ? 14 : (period === 'year' ? 12 : 7);
        const lastDays = Array.from({ length: days }, (_, i) => {
            const date = new Date();
            if (period === 'year') {
                date.setMonth(date.getMonth() - i);
                return `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
            }
            date.setDate(date.getDate() - i);
            const d = String(date.getDate()).padStart(2, '0');
            const m = String(date.getMonth() + 1).padStart(2, '0');
            return `${d}/${m}/${date.getFullYear()}`;
        }).reverse();

        const shortNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

        return lastDays.map(dateStr => {
            const dayOrders = orders.filter(o => !o.deleted && (o.date?.includes(dateStr)));
            const total = dayOrders.reduce((acc, curr) => acc + (curr.paymentsSummary?.totalOrderValue || 0), 0);
            
            let label = dateStr;
            if (period === 'year') {
                const [m] = dateStr.split('/');
                label = months[parseInt(m) - 1];
            } else {
                const [d, m, y] = dateStr.split('/');
                const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
                label = shortNames[dateObj.getDay()];
            }
            
            return { name: label, valor: total };
        });
    }, [orders, period]);

    const statusData = useMemo((): StatusDistribution[] => {
        const statusCounts: Record<string, number> = {};
        filteredOrders.forEach(o => {
            const status = o.status || 'draft';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        return Object.entries(statusCounts).map(([key, value]) => ({
            name: STATUS_LABELS[key] || key,
            value
        }));
    }, [filteredOrders]);

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
                        
                        <div className="relative">
                            <button 
                                onClick={() => setShowConfig(!showConfig)}
                                className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
                                title="Personalizar quais seções aparecem no Dashboard"
                            >
                                <i className="bi bi-gear-fill text-lg"></i>
                            </button>
                            
                            {showConfig && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowConfig(false)}></div>
                                    <div className="absolute top-full mt-3 left-0 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-2xl p-6 z-50 animate-slide-up">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Visibilidade</h4>
                                        <div className="space-y-4">
                                            {Object.entries(visibility).map(([key, val]) => (
                                                <button 
                                                    key={key}
                                                    onClick={() => setVisibility(v => ({ ...v, [key]: !val }))}
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
                
                <div className="flex items-center gap-3">
                    {/* Period Switcher */}
                    <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-1">
                        {PERIODS.map((p) => (
                            <button
                                key={p.value}
                                onClick={() => setPeriod(p.value)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === p.value ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                title={`Filtrar por ${p.label.toLowerCase()}`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                    
                    <div className="px-5 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest group">
                        <i className="bi bi-calendar3 text-blue-500 group-hover:rotate-12 transition-transform"></i>
                        {todayStr}
                    </div>
                </div>
            </div>

            {/* Top Metrics Grid */}
            {visibility.stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    <StatsCard 
                        title="Faturamento" 
                        value={formatCurrency(stats.totalSales)}
                        icon="currency-dollar"
                        trend={period !== 'today' ? 'up' : undefined}
                        trendValue="12.5%"
                        color="bg-blue-600"
                    />
                    <StatsCard 
                        title="Pedidos" 
                        value={stats.orderCount}
                        icon="bag-check-fill"
                        color="bg-emerald-600"
                    />
                    <StatsCard 
                        title="Ticket Médio" 
                        value={formatCurrency(stats.avgTicket)}
                        icon="graph-up-arrow"
                        color="bg-amber-600"
                    />
                    <StatsCard 
                        title="Pendentes" 
                        value={stats.pendingOrders}
                        icon="clock-history"
                        color="bg-rose-600"
                    />
                </div>
            )}

            {/* Main Visualizations Grid */}
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
                                        <div key={item.name} className="flex justify-between items-center px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
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

            {/* Bottom Actions Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pb-10">
                {visibility.reports && (
                    <div className="xl:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
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
                                            <div className="absolute bottom-0 left-0 w-full bg-blue-600 rounded-t-lg transition-all duration-500 group-hover:bg-blue-500" style={{ height: `${h}%` }}></div>
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
                        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-10 rounded-[2.5rem] text-white overflow-hidden relative group shadow-xl h-full flex flex-col justify-between">
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
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
