import { useState, useEffect, useMemo } from 'react';
import { subscribeToOrders } from '../../utils/orderHistoryService';
import Order from '../../types/order.type';
import { parse as parseDate, isSameDay, subDays, format } from 'date-fns';

export type Period = 'custom' | 'today' | 'week' | 'month' | 'last_month' | 'last_semester' | 'year';

export interface SalesHistory {
    date: string;
    valor: number;
    orders: number;
}

export interface DashboardStats {
    totalSales: number;
    saleCount: number;
    totalOrdersCount: number;
    totalProfit: number;
    avgTicket: number;
    pendingOrders: number;
    activeSchedules: number;
}

const parsePTBRDate = (dateStr: string): Date | null => {
    try {
        const [datePart] = dateStr.split(', ');
        return parseDate(datePart, 'dd/MM/yyyy', new Date());
    } catch {
        return null;
    }
};

const STATUS_LABELS: Record<string, string> = {
    draft: 'Rascunho',
    scheduled: 'Agendado',
    fulfilled: 'Atendido',
    cancelled: 'Cancelado'
};

export const useDashboardData = (period: Period, customStartDate?: string, customEndDate?: string) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToOrders((fetchedOrders: Order[]) => {
            setOrders(fetchedOrders);
            setLoading(false);
        });
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const filteredOrders = useMemo(() => {
        const active = orders.filter(o => !o.deleted);
        const now = new Date();

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
                case 'last_month': {
                    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    return oDate.getMonth() === lm.getMonth() && oDate.getFullYear() === lm.getFullYear();
                }
                case 'last_semester': {
                    const startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
                    const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
                    return oDate >= startDate && oDate <= endDate;
                }
                case 'year': return oDate.getFullYear() === now.getFullYear();
                case 'custom':
                    if (customStartDate && customEndDate) {
                        const s = new Date(customStartDate + "T00:00:00");
                        const e = new Date(customEndDate + "T23:59:59");
                        return oDate >= s && oDate <= e;
                    }
                    return true;
                default: return true;
            }
        });
    }, [orders, period, customStartDate, customEndDate]);

    const stats = useMemo((): DashboardStats => {
        const recognizedStatuses = ['scheduled', 'fulfilled'];
        const saleOrders = filteredOrders.filter(o => recognizedStatuses.includes(o.status || ''));
        
        const totalSales = saleOrders.reduce((acc, curr) => acc + (curr.paymentsSummary?.totalOrderValue || 0), 0);
        const saleCount = saleOrders.length;
        const avgTicket = saleCount > 0 ? totalSales / saleCount : 0;
        const totalOrdersCount = filteredOrders.length;
        
        const totalProfit = saleOrders.reduce((acc, o) => {
            const totalCost = o.itemsSummary?.totalItemsCost || 0;
            const totalValue = o.paymentsSummary?.totalOrderValue || 0;
            return acc + (totalValue - totalCost);
        }, 0);

        const pendingOrders = filteredOrders.filter(o => o.status === 'scheduled' || o.status === 'draft').length;
        
        const activeSchedules = filteredOrders.filter(o => 
            o.status === 'scheduled' && o.shipping?.scheduling?.date
        ).length;

        return {
            totalSales,
            saleCount,
            totalOrdersCount,
            totalProfit,
            avgTicket,
            pendingOrders,
            activeSchedules,
        };
    }, [filteredOrders]);

    const salesOverTime = useMemo(() => {
        const isMonthlyChart = period === 'year' || period === 'last_semester';
        const numDataPoints = period === 'year' ? 12 : period === 'last_semester' ? 6 : (period === 'last_month' || period === 'month' ? 30 : 7);
        const lastDays = Array.from({ length: numDataPoints }, (_, i) => {
            const date = new Date();
            if (isMonthlyChart) {
                const shift = period === 'last_semester' ? 1 : 0;
                date.setMonth(date.getMonth() - i - shift);
                return `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
            }
            if (period === 'last_month') {
                date.setDate(0);
            }
            date.setDate(date.getDate() - i);
            const d = String(date.getDate()).padStart(2, '0');
            const m = String(date.getMonth() + 1).padStart(2, '0');
            return `${d}/${m}/${date.getFullYear()}`;
        }).reverse();

        const shortNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

        return lastDays.map(dateStr => {
            const dayOrders = orders.filter(o =>
                !o.deleted &&
                (o.date?.includes(dateStr)) &&
                (['scheduled', 'fulfilled'].includes(o.status || ''))
            );
            const total = dayOrders.reduce((acc, curr) => acc + (curr.paymentsSummary?.totalOrderValue || 0), 0);

            let label = dateStr;
            if (period === 'year' || period === 'last_semester') {
                const [m] = dateStr.split('/');
                label = months[parseInt(m) - 1];
            } else {
                const [d, m, y] = dateStr.split('/');
                const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
                label = shortNames[dateObj.getDay()];
            }

            return { name: label, valor: total, orders: dayOrders.length };
        });
    }, [orders, period]);

    const statusData = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredOrders.forEach(o => {
            const rawStatus = o.status || 'draft';
            const label = STATUS_LABELS[rawStatus] || rawStatus;
            counts[label] = (counts[label] || 0) + 1;
        });

        return Object.entries(counts).map(([name, value]) => ({
            name,
            value
        }));
    }, [filteredOrders]);

    return { loading, stats, salesOverTime, statusData, filteredOrders };
};
