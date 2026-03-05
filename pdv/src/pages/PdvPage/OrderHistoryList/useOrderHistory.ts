import { useState, useEffect } from "react";
import Order from "../../types/pdvAction.type";
import { subscribeToOrders, deleteOrder } from "../../utils/orderHistoryService";
import { actionsMap, buttons } from "../PdvActions/pdvActionsConfig";

export const useOrderHistory = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToOrders((data) => {
            setOrders(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async (id: string) => {
        if (window.confirm("Certeza que deseja excluir este pedido?")) {
            await deleteOrder(id);
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
        orders,
        loading,
        handleDelete,
        handleAction
    };
};
