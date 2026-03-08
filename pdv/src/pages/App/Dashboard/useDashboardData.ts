import { useState, useEffect, useMemo } from 'react';
import { subscribeToOrders } from '../../utils/orderHistoryService';
import Order from '../../types/order.type';

export type Period = 'custom' | 'today' | 'week' | 'month' | 'semester' | 'year';

const parsePTBRDate = (dateStr: string): Date | null => {
    try {
        const [date] = dateStr.split(', ');
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
        return () => unsubscribe();
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
                case 'semester':
                    const currentHalf = now.getMonth() < 6 ? 0 : 1;
                    const oHalf = oDate.getMonth() < 6 ? 0 : 1;
                    return oHalf === currentHalf && oDate.getFullYear() === now.getFullYear();
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

    const stats = useMemo(() => {
        // DEFINIÇÃO DE VENDA: No sistema, uma venda é reconhecida quando um pedido
        // deixa de ser 'Rascunho' e passa para 'Agendado' (scheduled) ou 'Atendido' (fulfilled).
        // Pedidos em rascunho ou cancelados não contabilizam como venda.
        const recognizedStatuses = ['scheduled', 'fulfilled'];
        const saleOrders = filteredOrders.filter(o => recognizedStatuses.includes(o.status || ''));
        const totalSales = saleOrders.reduce((acc, curr) => acc + (curr.paymentsSummary?.totalOrderValue || 0), 0);
        const avgTicket = saleOrders.length > 0 ? totalSales / saleOrders.length : 0;

        // Pedidos pendentes são aqueles que ainda não foram atendidos (Rascunho e Agendado)
        const pendingOrders = filteredOrders.filter(o => o.status === 'scheduled' || o.status === 'draft').length;

        return {
            totalSales,
            orderCount: saleOrders.length,
            avgTicket,
            pendingOrders
        };
    }, [filteredOrders]);

    const salesOverTime = useMemo(() => {
        const days = period === 'year' || period === 'semester' ? 12 : 7;
        const lastDays = Array.from({ length: days }, (_, i) => {
            const date = new Date();
            if (period === 'year' || period === 'semester') {
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
            const dayOrders = orders.filter(o =>
                !o.deleted &&
                (o.date?.includes(dateStr)) &&
                (['scheduled', 'fulfilled'].includes(o.status || ''))
            );
            const total = dayOrders.reduce((acc, curr) => acc + (curr.paymentsSummary?.totalOrderValue || 0), 0);

            let label = dateStr;
            if (period === 'year' || period === 'semester') {
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

    return { loading, stats, salesOverTime, statusData };
};
