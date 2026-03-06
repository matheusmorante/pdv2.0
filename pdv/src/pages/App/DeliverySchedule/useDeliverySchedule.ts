import { useState, useEffect, useCallback } from "react";
import Order from "../../types/pdvAction.type";
import { subscribeToOrders, updateOrder } from "../../utils/orderHistoryService";
import { DropResult } from "@hello-pangea/dnd";
import { toast } from "react-toastify";

/**
 * Utility to group and sort orders by date and time
 */
const processOrders = (orders: Order[]) => {
    const scheduledOrders = orders.filter(
        (o) => o.shipping?.scheduling?.date && (o.shipping?.scheduling?.time || o.shipping?.scheduling?.startTime)
    );

    const grouped: Record<string, Order[]> = {};
    scheduledOrders.forEach((o) => {
        const dateStr = o.shipping.scheduling.date;
        if (!grouped[dateStr]) grouped[dateStr] = [];
        grouped[dateStr].push(o);
    });

    Object.keys(grouped).forEach((date) => {
        grouped[date].sort((a, b) => {
            if (a.orderIndex !== undefined && b.orderIndex !== undefined) {
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
    const [schedule, setSchedule] = useState<Record<string, Order[]>>({});
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"card" | "table">("card");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        const unsubscribe = subscribeToOrders((orders) => {
            const processed = processOrders(orders);
            setSchedule(processed);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

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
                return updateOrder({ ...order, orderIndex: index });
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
        selectedOrder,
        openOrderDetails,
        closeOrderDetails,
        handleShare,
        handleDragEnd,
    };
};
