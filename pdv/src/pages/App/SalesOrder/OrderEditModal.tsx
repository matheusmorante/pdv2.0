import React, { useEffect, useCallback } from "react";
import PdvFormSection from "./PdvFormSection";
import { usePdvForm } from "./usePdvForm";
import Order from "../../types/pdvAction.type";
import { updateOrder } from "../../utils/orderHistoryService";
import { toast } from "react-toastify";

interface OrderEditModalProps {
    order: Order;
    onClose: () => void;
    onSaveSuccess: () => void;
}

const OrderEditModal = ({ order, onClose, onSaveSuccess }: OrderEditModalProps) => {
    const form = usePdvForm();

    // Load order data into form on mount
    useEffect(() => {
        if (order) {
            form.actions.loadOrderForEditing(order);
        }
    }, [order, form.actions]);

    const handleUpdate = useCallback(async (e?: React.MouseEvent) => {
        e?.preventDefault();
        try {
            const updatedOrder = { ...form.state.currentOrder, id: order.id, date: order.date };
            await updateOrder(order.id!, updatedOrder);
            toast.success("Pedido atualizado com sucesso!");
            onSaveSuccess();
            onClose();
        } catch (error) {
            console.error("Erro ao atualizar pedido:", error);
            toast.error("Falha ao atualizar pedido.");
        }
    }, [form.state.currentOrder, order.id, order.date, onSaveSuccess, onClose]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-[2px] animate-fade-in">
            <div className="bg-white dark:bg-slate-950 w-full max-w-[95vw] h-[95vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-slide-up border border-white/20 dark:border-slate-800/50">
                {/* Modal Header */}
                <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 transition-colors duration-300">
                    <div className="flex items-center gap-5">
                        <div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-100 dark:shadow-blue-900/20">
                            <i className="bi bi-pencil-square text-white text-xl" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Editar Pedido</h2>
                            <p className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest mt-1">
                                ID do Pedido: <span className="text-blue-600 dark:text-blue-400">{order.id}</span> • Data: {order.date}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 rounded-2xl transition-all shadow-sm border border-slate-100 dark:border-slate-800 active:scale-95"
                    >
                        <i className="bi bi-x-lg text-xl" />
                    </button>
                </div>

                {/* Modal Content - Internal Scroll handled by PdvFormSection */}
                <div className="flex-1 overflow-hidden bg-white dark:bg-slate-900">
                    <PdvFormSection form={{
                        ...form,
                        actions: {
                            ...form.actions,
                            handleSaveOrder: handleUpdate
                        }
                    }} />
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slide-up { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}} />
        </div>
    );
};

export default OrderEditModal;
