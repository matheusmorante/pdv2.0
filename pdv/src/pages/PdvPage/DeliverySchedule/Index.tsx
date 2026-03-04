import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import Order from "../../types/pdvAction.type";
import { subscribeToOrders, updateOrder } from "../../utils/orderHistoryService";
import { stringifyFullAddressWithObservation, stringifyItemsWithValues } from "../../utils/fomatters";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

const DeliverySchedule = () => {
    const [schedule, setSchedule] = useState<Record<string, Order[]>>({});
    const [loading, setLoading] = useState(true);
    const scheduleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = subscribeToOrders((orders) => {
            // Filter orders that have scheduling
            const scheduledOrders = orders.filter(
                o => o.shipping?.scheduling?.date && o.shipping?.scheduling?.time
            );

            // Group by Date
            const grouped: Record<string, Order[]> = {};
            scheduledOrders.forEach(o => {
                const dateStr = o.shipping.scheduling.date;
                if (!grouped[dateStr]) grouped[dateStr] = [];
                grouped[dateStr].push(o);
            });

            // Sort each group
            Object.keys(grouped).forEach(date => {
                grouped[date].sort((a, b) => {
                    // Try to sort by manual orderIndex first
                    if (a.orderIndex !== undefined && b.orderIndex !== undefined) {
                        return a.orderIndex - b.orderIndex;
                    }
                    if (a.orderIndex !== undefined) return -1;
                    if (b.orderIndex !== undefined) return 1;

                    // Fallback to time string
                    return a.shipping.scheduling.time.localeCompare(b.shipping.scheduling.time);
                });
            });

            // Sort keys (dates) and build a new sorted object
            const sortedGroups: Record<string, Order[]> = {};
            Object.keys(grouped).sort().forEach(date => {
                sortedGroups[date] = grouped[date];
            });

            setSchedule(sortedGroups);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleShare = async () => {
        if (!scheduleRef.current) return;

        try {
            const canvas = await html2canvas(scheduleRef.current, {
                scale: 2, // better quality
                useCORS: true,
                backgroundColor: "#ffffff"
            });

            const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

            // Trigger download of the image
            const link = document.createElement("a");
            link.download = `Cronograma_Entregas_${new Date().toLocaleDateString().replace(/\//g, '-')}.jpeg`;
            link.href = dataUrl;
            link.click();

            // Open Whatsapp with instruction
            const text = encodeURIComponent("📦 Segue o Cronograma de Entregas. (Por favor, anexe a imagem JPEG que acabou de ser baixada)");
            window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");

        } catch (error) {
            console.error("Erro ao gerar imagem: ", error);
            alert("Não foi possível gerar a imagem do cronograma.");
        }
    };

    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        const sourceDate = result.source.droppableId;
        const destDate = result.destination.droppableId;

        // Only allow dropping in the same date group
        if (sourceDate !== destDate) return;

        const dateOrders = Array.from(schedule[sourceDate] || []);

        // Reorder the array locally
        const [reorderedItem] = dateOrders.splice(result.source.index, 1);
        dateOrders.splice(result.destination.index, 0, reorderedItem);

        // Optimistically update the UI to prevent bouncing
        setSchedule(prev => ({
            ...prev,
            [sourceDate]: dateOrders
        }));

        // Now save the new orderIndexes to Firebase
        try {
            // Processing updates sequentially to avoid race conditions 
            // Better would be a batched write, but this is simple and works for small lists
            const updatePromises = dateOrders.map((order, index) => {
                return updateOrder({ ...order, orderIndex: index });
            });
            await Promise.all(updatePromises);
        } catch (error) {
            console.error("Erro ao reordenar pedidos no Firebase", error);
        }
    };

    return (
        <div className="w-[900px] mx-auto mt-4 p-4 shadow-lg shadow-slate-400 bg-white">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center">
                    <i className="bi bi-calendar-check mr-2 text-blue-600" />
                    Cronograma de Entregas
                </h2>
                <button
                    onClick={handleShare}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow flex items-center"
                >
                    <i className="bi bi-whatsapp mr-2" /> Gerar Imagem e Enviar
                </button>
            </div>

            {loading ? (
                <p className="text-blue-500 text-center py-10"><i className="bi bi-arrow-repeat animate-spin inline-block mr-2" /> Carregando cronograma...</p>
            ) : Object.keys(schedule).length === 0 ? (
                <p className="text-gray-500 text-center py-10">Nenhuma entrega agendada encontrada.</p>
            ) : (
                <div
                    ref={scheduleRef}
                    className="flex flex-col gap-8 bg-white p-4"
                    id="schedule-capture-area"
                >
                    {/* Visual header for the exported image */}
                    <div className="text-center mb-4 pb-4 border-b-2 border-dashed border-gray-300">
                        <h1 className="text-2xl font-black uppercase text-gray-800">Cronograma de Entregas</h1>
                        <p className="text-gray-500">Gerado em {new Date().toLocaleString()}</p>
                    </div>

                    <DragDropContext onDragEnd={handleDragEnd}>
                        {Object.entries(schedule).map(([date, orders]) => (
                            <div key={date} className="w-full mb-4">
                                <h3 className="text-lg font-bold bg-blue-100 text-blue-800 px-3 py-1 border-l-4 border-blue-600 mb-3">
                                    Data: {new Date(date + "T00:00:00").toLocaleDateString('pt-BR')}
                                </h3>

                                <Droppable droppableId={date}>
                                    {(provided) => (
                                        <div
                                            className="flex flex-col gap-4"
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                        >
                                            {orders.map((order, index) => (
                                                <Draggable key={order.id!} draggableId={order.id!} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            className={`border rounded-md shadow-sm overflow-hidden border-gray-200 bg-white ${snapshot.isDragging ? 'shadow-lg shadow-blue-200 scale-[1.02] ring-2 ring-blue-500 z-50' : ''
                                                                }`}
                                                        >
                                                            <div className="bg-gray-100 px-3 py-2 border-b flex justify-between items-center bg-zinc-200">
                                                                <div className="flex items-center gap-2">
                                                                    <div
                                                                        {...provided.dragHandleProps}
                                                                        className="mr-2 cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-800 p-1 bg-gray-300 rounded"
                                                                        title="Arraste para reordenar"
                                                                    >
                                                                        <i className="bi bi-grip-vertical" />
                                                                    </div>
                                                                    <span className="font-bold text-md flex items-center text-zinc-800">
                                                                        <i className="bi bi-clock-fill mr-1 text-orange-600" />
                                                                        Período: {order.shipping.scheduling.time}
                                                                    </span>
                                                                </div>
                                                                <span className="text-sm font-semibold bg-gray-300 px-2 rounded">
                                                                    ID: {order.id?.split('-')[0].toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <div className="p-3 text-sm flex flex-col gap-2">
                                                                <div>
                                                                    <span className="font-bold text-gray-700">Cliente: </span>
                                                                    <span className="text-lg font-semibold">{order.customerData?.fullName || "Não informado"}</span>
                                                                </div>

                                                                <div className="flex items-start gap-1">
                                                                    <i className="bi bi-geo-alt-fill text-red-500 mt-1" />
                                                                    <span className="text-gray-700 leading-snug">
                                                                        {stringifyFullAddressWithObservation(order.customerData?.fullAddress)}
                                                                    </span>
                                                                </div>

                                                                <div className="mt-2 bg-yellow-50 p-2 border border-yellow-200 rounded text-gray-800 text-xs font-mono whitespace-pre-line">
                                                                    <span className="font-bold block mb-1">Itens:</span>
                                                                    {stringifyItemsWithValues(order.items)}
                                                                </div>

                                                                {order.observation && (
                                                                    <div className="mt-1 flex items-start text-red-700 bg-red-50 p-2 rounded">
                                                                        <i className="bi bi-exclamation-triangle-fill mr-1 mt-0.5" />
                                                                        <span className="italic">Obs: {order.observation}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        ))}
                    </DragDropContext>
                </div>
            )}
        </div>
    );
};

export default DeliverySchedule;
