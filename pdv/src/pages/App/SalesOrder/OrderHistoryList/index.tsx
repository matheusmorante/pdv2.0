import Order from "../../../types/pdvAction.type";
import { useOrderHistory } from "./useOrderHistory";
import OrderHistoryTable from "./OrderHistoryTable";

type OrderHistoryListProps = {
    onEdit: (order: Order) => void;
};

const OrderHistoryList = ({ onEdit }: OrderHistoryListProps) => {
    const { orders, loading, handleDelete, handleAction } = useOrderHistory();

    const renderContent = () => {
        if (loading) {
            return (
                <p className="text-blue-500 text-center py-4">
                    <i className="bi bi-arrow-repeat animate-spin inline-block mr-2" />
                    Carregando pedidos da nuvem...
                </p>
            );
        }

        if (orders.length === 0) {
            return <p className="text-gray-500 text-center">Nenhum pedido salvo.</p>;
        }

        return (
            <OrderHistoryTable
                orders={orders}
                onEdit={onEdit}
                onDelete={handleDelete}
                onAction={handleAction}
            />
        );
    };

    return (
        <div className="w-[900px] mx-auto mt-4 p-4 shadow-lg shadow-slate-400 bg-white">
            <h2 className="text-xl font-bold mb-4">Histórico de Pedidos</h2>
            {renderContent()}
        </div>
    );
};

export default OrderHistoryList;
