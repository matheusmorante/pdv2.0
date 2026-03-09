import { useState, useEffect, useMemo } from "react";
import Order from "../../../types/order.type";
import { subscribeToOrders, moveToTrash, restoreOrder, permanentDeleteOrder, updateOrder } from "../../../utils/orderHistoryService";
import { actionsMap, buttons } from "../OrderActions/orderActionsConfig";
import { toast } from "react-toastify";

export const useOrderHistory = (filters?: any) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

    useEffect(() => {
        let active = true; // Will be set to false on cleanup

        console.log('[Orders] Hook Start');

        // Failsafe: force loading false after 8 seconds if data never arrives
        const failsafe = setTimeout(() => {
            if (active) {
                console.warn('[Orders] Failsafe timer fired - no data received');
                setLoading(false);
            }
        }, 8000);

        const unsubscribe = subscribeToOrders((data) => {
            // Only update state if this effect instance is still active
            if (!active) return;

            if (Array.isArray(data)) {
                console.log('[Orders] Data received, count:', data.length);
                setOrders(data);
            } else {
                console.error('[Orders] Data is not an array:', data);
                setOrders([]);
            }

            setLoading(false);
            clearTimeout(failsafe);
        });

        return () => {
            console.log('[Orders] Hook Cleanup');
            active = false;
            clearTimeout(failsafe);
            unsubscribe();
        };
    }, []);

    // Reset pagination and selection when filters change
    useEffect(() => {
        setCurrentPage(1);
        setSelectedOrders([]);
    }, [filters]);

    const filteredOrders = useMemo(() => {
        const showTrash = filters?.showTrash || false;

        const toComparableDate = (dateStr: string) => {
            if (!dateStr || !dateStr.includes('/')) return dateStr;
            const [day, month, year] = dateStr.split('/');
            return `${year}-${month}-${day}`;
        };

        return orders
            .filter(order => {
                // Filter by Deleted status first
                if (showTrash) {
                    if (!order.deleted) return false;
                } else {
                    if (order.deleted) return false;
                }

                if (!filters) return true;

                const orderDateComp = toComparableDate(order.date);
                const dateMatch = (!filters.dateRange.start || orderDateComp >= filters.dateRange.start) &&
                    (!filters.dateRange.end || orderDateComp <= filters.dateRange.end);

                const customerMatch = !filters.customerName ||
                    order.customerData?.fullName?.toLowerCase().includes(filters.customerName.toLowerCase());

                const productMatch = !filters.productName ||
                    (order.items?.some(item => item.description.toLowerCase().includes(filters.productName.toLowerCase()))) ||
                    (order.assistanceDescription?.toLowerCase().includes(filters.productName.toLowerCase()));

                const totalOrderValue = order.paymentsSummary?.totalOrderValue || 0;
                const valueMatch = totalOrderValue >= filters.valueRange.min &&
                    totalOrderValue <= filters.valueRange.max;

                return dateMatch && customerMatch && productMatch && valueMatch;
            })
            .sort((a, b) => {
                let comparison = 0;
                const sortBy = filters?.sortBy || 'date';

                if (sortBy === "customer") {
                    comparison = (a.customerData?.fullName || "").localeCompare(b.customerData?.fullName || "");
                } else if (sortBy === "totalValue") {
                    comparison = (a.paymentsSummary?.totalOrderValue || 0) - (b.paymentsSummary?.totalOrderValue || 0);
                } else if (sortBy === "status") {
                    comparison = (a.status || "").localeCompare(b.status || "");
                } else if (sortBy === "deliveryDate") {
                    const dateA = toComparableDate(a.shipping?.scheduling?.date || "");
                    const dateB = toComparableDate(b.shipping?.scheduling?.date || "");
                    comparison = dateA.localeCompare(dateB);
                } else {
                    const dateA = toComparableDate(a.date || "");
                    const dateB = toComparableDate(b.date || "");
                    comparison = dateA.localeCompare(dateB);
                }
                const sortOrder = filters?.sortOrder || 'desc';
                return sortOrder === "asc" ? comparison : -comparison;
            });
    }, [orders, filters]);

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const totalItems = filteredOrders.length;

    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredOrders.slice(start, start + itemsPerPage);
    }, [filteredOrders, currentPage, itemsPerPage]);

    const handleDelete = async (id: string) => {
        await moveToTrash(id);
        toast.info("Pedido movido para a lixeira.");
    };

    const handleRestore = async (id: string) => {
        await restoreOrder(id);
        toast.success("Pedido restaurado com sucesso!");
    };

    const handlePermanentDelete = async (id: string) => {
        if (window.confirm("Certeza que deseja excluir DEFINITIVAMENTE este pedido? Esta ação não pode ser desfeita.")) {
            await permanentDeleteOrder(id);
            toast.success("Pedido excluído permanentemente.");
        }
    };

    const handleBulkTrash = async () => {
        if (selectedOrders.length === 0) return;
        setLoading(true);
        try {
            await Promise.all(selectedOrders.map(id => moveToTrash(id)));
            toast.info(`${selectedOrders.length} pedido(s) movido(s) para a lixeira.`);
            setSelectedOrders([]);
        } catch (error) {
            toast.error("Erro ao mover alguns pedidos para a lixeira.");
        } finally {
            setLoading(false);
        }
    };

    const handleBulkRestore = async () => {
        if (selectedOrders.length === 0) return;
        setLoading(true);
        try {
            await Promise.all(selectedOrders.map(id => restoreOrder(id)));
            toast.success(`${selectedOrders.length} pedido(s) restaurado(s) com sucesso!`);
            setSelectedOrders([]);
        } catch (error) {
            toast.error("Erro ao restaurar alguns pedidos.");
        } finally {
            setLoading(false);
        }
    };

    const handleBulkPermanentDelete = async () => {
        if (selectedOrders.length === 0) return;
        if (window.confirm(`Certeza que deseja excluir DEFINITIVAMENTE ${selectedOrders.length} pedido(s)? Esta ação não pode ser desfeita.`)) {
            setLoading(true);
            try {
                await Promise.all(selectedOrders.map(id => permanentDeleteOrder(id)));
                toast.success(`${selectedOrders.length} pedido(s) excluído(s) permanentemente.`);
                setSelectedOrders([]);
            } catch (error) {
                toast.error("Erro ao excluir alguns pedidos.");
            } finally {
                setLoading(false);
            }
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedOrders(prev =>
            prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        const allIdsOnPage = paginatedOrders.map(o => o.id!).filter(Boolean);
        const allSelected = allIdsOnPage.every(id => selectedOrders.includes(id));

        if (allSelected) {
            setSelectedOrders(prev => prev.filter(id => !allIdsOnPage.includes(id)));
        } else {
            const newSelections = allIdsOnPage.filter(id => !selectedOrders.includes(id));
            setSelectedOrders(prev => [...prev, ...newSelections]);
        }
    };

    const clearSelection = () => setSelectedOrders([]);

    const handleStatusUpdate = async (id: string, newStatus: Order['status']) => {
        // Find full order in local state to avoid a pre-fetch (which was returning 400)
        const currentOrder = orders.find(o => o.id === id);

        // Optimistic update
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
        try {
            // Pass currentOrder so updateOrder skips the SELECT entirely
            await updateOrder(id, { status: newStatus }, currentOrder);
            toast.success("Status do pedido atualizado!");
        } catch (error) {
            // Rollback on failure
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status: currentOrder?.status } as Order : o));
            console.error("Erro ao atualizar status:", error);
            toast.error("Erro ao atualizar status do pedido.");
        }
    };

    const handleAction = async (actionKey: string, order: Order) => {
        const actionDef = buttons.find(b => b.key === actionKey);
        if (actionDef) {
            sessionStorage.setItem("order", JSON.stringify(order));
            actionsMap[actionDef.action](order);

            // If it's the review action, update the order in the background
            if (actionKey === "sendCustomerReviews" && order.id && !order.reviewRequested) {
                // Optimistic update: hide the button immediately
                setOrders(prev => prev.map(o => o.id === order.id ? { ...o, reviewRequested: true } : o));
                try {
                    await updateOrder(order.id, { reviewRequested: true });
                } catch (error) {
                    // Rollback optimistic update on failure
                    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, reviewRequested: false } : o));
                    console.error("Erro ao marcar avaliação como enviada:", error);
                }
            }
        }
    };

    return {
        orders: paginatedOrders,
        totalItems,
        currentPage,
        itemsPerPage,
        totalPages,
        setCurrentPage,
        setItemsPerPage,
        loading,
        handleDelete,
        handleRestore,
        handlePermanentDelete,
        handleAction,
        handleStatusUpdate,
        selectedOrders,
        toggleSelection,
        selectAll,
        clearSelection,
        handleBulkTrash,
        handleBulkRestore,
        handleBulkPermanentDelete
    };
};
