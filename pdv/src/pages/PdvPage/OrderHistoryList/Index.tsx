import { useState, useEffect } from "react";
import Order from "../../types/pdvAction.type";
import { getOrders, deleteOrder } from "../../utils/orderHistoryService";
import { actionsMap, buttons } from "../PdvActions/pdvActionsConfig";

type OrderHistoryListProps = {
    onEdit: (order: Order) => void;
};

const OrderHistoryList = ({ onEdit }: OrderHistoryListProps) => {
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = () => {
        setOrders(getOrders());
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Certeza que deseja excluir este pedido?")) {
            deleteOrder(id);
            loadOrders();
        }
    };

    const handleAction = (actionKey: string, order: Order) => {
        const actionDef = buttons.find(b => b.key === actionKey);
        if (actionDef) {
            sessionStorage.setItem("order", JSON.stringify(order));
            actionsMap[actionDef.action](order);
        }
    }

    return (
        <div className="w-[900px] mx-auto mt-4 p-4 shadow-lg shadow-slate-400 bg-white">
            <h2 className="text-xl font-bold mb-4">Histórico de Pedidos</h2>
            {orders.length === 0 ? (
                <p className="text-gray-500 text-center">Nenhum pedido salvo.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left [&_th]:border-2 [&_td]:border-2 [&_td]:px-2 [&_th]:px-2 [&_td]:border-gray-200 [&_th]:bg-gray-300 [&_th]:py-2 [&_td]:py-2">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Cliente</th>
                                <th>Total</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id} className="hover:bg-gray-100">
                                    <td>{order.date}</td>
                                    <td>{order.customerData?.fullName || "Cliente não informado"}</td>
                                    <td>
                                        R$ {(
                                            order.itemsSummary.itemsTotalValue +
                                            order.shipping.value
                                        ).toFixed(2).replace('.', ',')}
                                    </td>
                                    <td className="flex gap-2 items-center flex-wrap">
                                        <button
                                            onClick={(e) => { e.preventDefault(); onEdit(order); }}
                                            className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                                            title="Editar"
                                        >
                                            <i className="bi bi-pencil" /> Editar
                                        </button>
                                        <button
                                            onClick={(e) => { e.preventDefault(); handleDelete(order.id!); }}
                                            className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                                            title="Apagar"
                                        >
                                            <i className="bi bi-trash" /> Apagar
                                        </button>
                                        <select
                                            className="border p-1 rounded bg-gray-50"
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    handleAction(e.target.value, order);
                                                    e.target.value = "";
                                                }
                                            }}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Ações Rápidas...</option>
                                            {buttons.map(btn => (
                                                <option key={btn.key} value={btn.key}>{btn.label}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default OrderHistoryList;
