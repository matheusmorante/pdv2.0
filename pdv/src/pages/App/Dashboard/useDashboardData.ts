import { useState, useEffect, useMemo } from 'react';
import { subscribeToOrders } from '../../utils/orderHistoryService';
import Order from '../../types/order.type';

export type Period = 'today' | 'week' | 'month' | 'year' | 'max';

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

export const useDashboardData = (period: Period) => {
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
                case 'year': return oDate.getFullYear() === now.getFullYear();
                case 'max': return true;
                default: return true;
            }
        });
    }, [orders, period]);

    const stats = useMemo(() => {
        // Uma venda é reconhecida quando está 'Atendida', 'Agendada' ou 'Completa' (antigo)
        const recognizedStatuses = ['scheduled', 'fulfilled', 'completed'];
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
            const dayOrders = orders.filter(o =>
                !o.deleted &&
                (o.date?.includes(dateStr)) &&
                (['scheduled', 'fulfilled', 'completed'].includes(o.status || ''))
            );
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
