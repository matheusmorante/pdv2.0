import { useState, useEffect, useCallback } from "react";
import Order from "../../types/pdvAction.type";
import { subscribeToOrders, updateOrder } from "../../utils/orderHistoryService";
import { DropResult } from "@hello-pangea/dnd";
import { toast } from "react-toastify";

export type ScheduleFilter = 'default' | 'week' | 'month' | 'year' | 'all';
export type OrderTypeFilter = 'all' | 'delivery' | 'pickup' | 'assistance';

/**
 * Utility to group and sort orders by date and time with range filtering
 */
const processOrders = (orders: Order[], filter: ScheduleFilter, typeFilter: OrderTypeFilter) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Yesterday for 'default' view
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Week boundaries (Sun-Sat)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const scheduledOrders = orders.filter((o) => {
        if (o.status !== 'scheduled' && o.status !== 'fulfilled') return false; // Show scheduled and fulfilled orders

        const orderDateStr = o.shipping?.scheduling?.date;
        if (!orderDateStr) return false;

        const hasTime = o.shipping?.scheduling?.time || o.shipping?.scheduling?.startTime;
        if (!hasTime) return false;

        // Apply order type filter
        const isPickup = o.shipping?.deliveryMethod === 'pickup';
        const isAssistance = o.orderType === 'assistance';
        const isDelivery = !isPickup && !isAssistance;

        if (typeFilter === 'pickup' && !isPickup) return false;
        if (typeFilter === 'assistance' && !isAssistance) return false;
        if (typeFilter === 'delivery' && !isDelivery) return false;

        if (filter === 'all') return true;

        if (filter === 'default') {
            return orderDateStr >= yesterdayStr;
        }

        if (filter === 'week') {
            return orderDateStr >= startOfWeek.toISOString().split('T')[0] &&
                orderDateStr <= endOfWeek.toISOString().split('T')[0];
        }

        if (filter === 'month') {
            return orderDateStr.startsWith(todayStr.substring(0, 7)); // YYYY-MM
        }

        if (filter === 'year') {
            return orderDateStr.startsWith(todayStr.substring(0, 4)); // YYYY
        }

        return true;
    });

    const grouped: Record<string, Order[]> = {};
    scheduledOrders.forEach((o) => {
        const dateStr = o.shipping.scheduling.date;
        if (!grouped[dateStr]) grouped[dateStr] = [];
        grouped[dateStr].push(o);
    });

    Object.keys(grouped).forEach((date) => {
        grouped[date].sort((a, b) => {
            if (a.orderIndex !== undefined && b.orderIndex !== undefined && a.shipping.scheduling.date === b.shipping.scheduling.date) {
                return a.orderIndex - b.orderIndex;
            }
            const timeA = a.shipping.scheduling.startTime || a.shipping.scheduling.time || "";
            const timeB = b.shipping.scheduling.startTime || b.shipping.scheduling.time || "";
            return timeA.localeCompare(timeB);
        });
    });

    const sortedGroups: Record<string, Order[]> = {};
    Object.keys(grouped)
        .sort()
        .forEach((date) => {
            sortedGroups[date] = grouped[date];
        });

    return sortedGroups;
};

export const useDeliverySchedule = () => {
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [schedule, setSchedule] = useState<Record<string, Order[]>>({});
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"card" | "table">("card");
    const [filter, setFilter] = useState<ScheduleFilter>('default');
    const [typeFilter, setTypeFilter] = useState<OrderTypeFilter>('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        const unsubscribe = subscribeToOrders((orders) => {
            setAllOrders(orders);
            const processed = processOrders(orders, filter, typeFilter);
            setSchedule(processed);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [filter, typeFilter]);

    // Re-process when filter changes locally
    useEffect(() => {
        if (!loading) {
            setSchedule(processOrders(allOrders, filter, typeFilter));
        }
    }, [filter, typeFilter, allOrders, loading]);

    const handleShare = () => {
        const scheduleUrl = `${window.location.origin}/schedule`;
        const shareText = encodeURIComponent(
            `📦 Cronograma de Entregas (${viewMode === "card" ? "Lista" : "Grade"})\n` +
            `🔗 Acesse online agora: ${scheduleUrl}`
        );

        window.open(`https://api.whatsapp.com/send?text=${shareText}`, "_blank");
    };

    const handleDragEnd = useCallback(async (result: DropResult) => {
        if (!result.destination || viewMode === "table") return;

        const sourceDate = result.source.droppableId;
        const destDate = result.destination.droppableId;

        if (sourceDate !== destDate) return;

        const dateOrders = Array.from(schedule[sourceDate] || []);
        const [reorderedItem] = dateOrders.splice(result.source.index, 1);
        dateOrders.splice(result.destination.index, 0, reorderedItem);

        setSchedule((prev) => ({
            ...prev,
            [sourceDate]: dateOrders,
        }));

        try {
            const updatePromises = dateOrders.map((order, index) => {
                return updateOrder(order.id!, { ...order, orderIndex: index });
            });
            await Promise.all(updatePromises);
        } catch (error) {
            console.error("Erro ao reordenar pedidos no Firebase", error);
            toast.error("Erro ao salvar ordem no servidor.");
        }
    }, [schedule, viewMode]);

    const openOrderDetails = (order: Order) => setSelectedOrder(order);
    const closeOrderDetails = () => setSelectedOrder(null);

    return {
        schedule,
        loading,
        viewMode,
        setViewMode,
        filter,
        setFilter,
        typeFilter,
        setTypeFilter,
        selectedOrder,
        openOrderDetails,
        closeOrderDetails,
        handleShare,
        handleDragEnd,
    };
};
