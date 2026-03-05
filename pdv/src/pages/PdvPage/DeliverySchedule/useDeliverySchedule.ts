import { useState, useEffect, useRef, useCallback } from "react";
import html2canvas from "html2canvas";
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
    const scheduleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = subscribeToOrders((orders) => {
            const processed = processOrders(orders);
            setSchedule(processed);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleShare = async () => {
        if (!scheduleRef.current) return;

        const toastId = toast.loading("Gerando imagem do cronograma...");

        try {
            const canvas = await html2canvas(scheduleRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
                logging: false,
            });

            const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
            const link = document.createElement("a");
            const fileName = `Cronograma_${viewMode}_${new Date().toLocaleDateString().replace(/\//g, "-")}`;

            link.download = `${fileName}.jpeg`;
            link.href = dataUrl;
            link.click();

            const scheduleUrl = `${window.location.origin}/schedule`;
            const shareText = encodeURIComponent(
                `📦 Cronograma de Entregas (${viewMode === "card" ? "Lista" : "Grade"})\n` +
                `🔗 Acesse online: ${scheduleUrl}\n\n` +
                `🔔 (Por favor, anexe a imagem JPEG que acabou de ser baixada para visualização rápida)`
            );

            window.open(`https://api.whatsapp.com/send?text=${shareText}`, "_blank");

            toast.update(toastId, {
                render: "Imagem gerada com sucesso! Verifique sua pasta de downloads.",
                type: "success",
                isLoading: false,
                autoClose: 3000,
            });
        } catch (error) {
            console.error("Erro ao gerar imagem: ", error);
            toast.update(toastId, {
                render: "Falha ao gerar imagem do cronograma.",
                type: "error",
                isLoading: false,
                autoClose: 3000,
            });
        }
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

    return {
        schedule,
        loading,
        viewMode,
        setViewMode,
        scheduleRef,
        handleShare,
        handleDragEnd,
    };
};
