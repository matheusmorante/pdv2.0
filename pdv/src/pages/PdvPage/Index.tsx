import { useState } from "react";
import Order from "../types/pdvAction.type";
import DeliverySchedule from "./DeliverySchedule/index";
import OrderHistoryList from "./OrderHistoryList/index";
import { usePdvForm } from "./usePdvForm";
import PdvTabs from "./PdvTabs";
import PdvFormSection from "./PdvFormSection";
import OrderEditModal from "./OrderEditModal";

const PdvPage = () => {
    const [activeTab, setActiveTab] = useState<"pdv" | "history" | "schedule">("pdv");
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const form = usePdvForm();

    const handleEditOrder = (order: Order) => {
        setEditingOrder(order);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case "pdv":
                return <PdvFormSection form={form} />;
            case "history":
                return <OrderHistoryList onEdit={handleEditOrder} />;
            case "schedule":
                return <DeliverySchedule />;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col mx-auto w-full items-center mb-10">
            <PdvTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            {renderTabContent()}

            {editingOrder && (
                <OrderEditModal
                    order={editingOrder}
                    onClose={() => setEditingOrder(null)}
                    onSaveSuccess={() => {
                        // Optional: trigger a refresh if needed, 
                        // but subscribeToOrders should handle it automatically
                    }}
                />
            )}
        </div>
    );
};

export default PdvPage;