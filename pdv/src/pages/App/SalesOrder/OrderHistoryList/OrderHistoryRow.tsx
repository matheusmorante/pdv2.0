import Order from "../../../types/pdvAction.type";
import { buttons } from "../PdvActions/pdvActionsConfig";

type OrderHistoryRowProps = {
    order: Order;
    onEdit: (order: Order) => void;
    onDelete: (id: string) => void;
    onAction: (actionKey: string, order: Order) => void;
};

const OrderHistoryRow = ({ order, onEdit, onDelete, onAction }: OrderHistoryRowProps) => {
    const total = (order.itemsSummary.itemsTotalValue + order.shipping.value)
        .toFixed(2)
        .replace(".", ",");

    return (
        <tr className="hover:bg-gray-100">
            <td>{order.date}</td>
            <td>{order.customerData?.fullName || "Cliente não informado"}</td>
            <td>R$ {total}</td>
            <td className="flex gap-2 items-center flex-wrap">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onEdit(order);
                    }}
                    className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                    title="Editar"
                >
                    <i className="bi bi-pencil" /> Editar
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onDelete(order.id!);
                    }}
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                    title="Apagar"
                >
                    <i className="bi bi-trash" /> Apagar
                </button>
                <select
                    className="border p-1 rounded bg-gray-50"
                    onChange={(e) => {
                        if (e.target.value) {
                            onAction(e.target.value, order);
                            e.target.value = "";
                        }
                    }}
                    defaultValue=""
                >
                    <option value="" disabled>
                        Ações Rápidas...
                    </option>
                    {buttons.map((btn) => (
                        <option key={btn.key} value={btn.key}>
                            {btn.label}
                        </option>
                    ))}
                </select>
            </td>
        </tr>
    );
};

export default OrderHistoryRow;
