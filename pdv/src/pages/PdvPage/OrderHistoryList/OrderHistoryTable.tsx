import Order from "../../types/pdvAction.type";
import OrderHistoryRow from "./OrderHistoryRow";

type OrderHistoryTableProps = {
    orders: Order[];
    onEdit: (order: Order) => void;
    onDelete: (id: string) => void;
    onAction: (actionKey: string, order: Order) => void;
};

const OrderHistoryTable = ({ orders, onEdit, onDelete, onAction }: OrderHistoryTableProps) => {
    return (
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
                    {orders.map((order) => (
                        <OrderHistoryRow
                            key={order.id}
                            order={order}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onAction={onAction}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrderHistoryTable;
