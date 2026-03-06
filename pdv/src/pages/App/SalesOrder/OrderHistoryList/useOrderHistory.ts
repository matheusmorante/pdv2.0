import { useState, useEffect, useMemo } from "react";
import Order from "../../../types/pdvAction.type";
import { subscribeToOrders, deleteOrder, updateOrder } from "../../../utils/orderHistoryService";
import { actionsMap, buttons } from "../PdvActions/pdvActionsConfig";
import { toast } from "react-toastify";

export const useOrderHistory = (filters?: any) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        const unsubscribe = subscribeToOrders((data) => {
            setOrders(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    const filteredOrders = useMemo(() => {
        if (!filters) return orders;

        return orders
            .filter(order => {
                const dateMatch = (!filters.dateRange.start || order.date >= filters.dateRange.start) &&
                    (!filters.dateRange.end || order.date <= filters.dateRange.end);

                const customerMatch = !filters.customerName ||
                    order.customerData?.fullName?.toLowerCase().includes(filters.customerName.toLowerCase());

                const productMatch = !filters.productName ||
                    order.items?.some(item => item.description.toLowerCase().includes(filters.productName.toLowerCase()));

                const valueMatch = (order.paymentsSummary.totalOrderValue || 0) >= filters.valueRange.min &&
                    (order.paymentsSummary.totalOrderValue || 0) <= filters.valueRange.max;

                return dateMatch && customerMatch && productMatch && valueMatch;
            })
            .sort((a, b) => {
                let comparison = 0;
                if (filters.sortBy === "customer") {
                    comparison = (a.customerData?.fullName || "").localeCompare(b.customerData?.fullName || "");
                } else {
                    comparison = (a.date || "").localeCompare(b.date || "");
                }
                return filters.sortOrder === "asc" ? comparison : -comparison;
            });
    }, [orders, filters]);

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const totalItems = filteredOrders.length;

    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredOrders.slice(start, start + itemsPerPage);
    }, [filteredOrders, currentPage, itemsPerPage]);

    const handleDelete = async (id: string) => {
        if (window.confirm("Certeza que deseja excluir este pedido?")) {
            await deleteOrder(id);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: Order['status']) => {
        try {
            await updateOrder(id, { status: newStatus });
            toast.success("Status do pedido atualizado!");
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            toast.error("Erro ao atualizar status do pedido.");
        }
    };

    const handleAction = (actionKey: string, order: Order) => {
        const actionDef = buttons.find(b => b.key === actionKey);
        if (actionDef) {
            sessionStorage.setItem("order", JSON.stringify(order));
            actionsMap[actionDef.action](order);
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
        handleAction,
        handleStatusUpdate
    };
};
