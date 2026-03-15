import React, { useCallback } from "react";
import SalesOrderFormSection from "./SalesOrderFormSection";
import { useSalesOrderForm } from "./useSalesOrderForm";

interface NewSaleOrderProps {
    onClose: () => void;
    onSaveSuccess: () => void;
    initialDeliveryMethod?: 'delivery' | 'pickup';
}

const NewSaleOrder = ({ onClose, onSaveSuccess, initialDeliveryMethod }: NewSaleOrderProps) => {
    const form = useSalesOrderForm(initialDeliveryMethod);
    const isPickup = form.state.shipping.deliveryMethod === 'pickup';
    const isEditing = false; // We can add an isEditing prop later if NewSaleOrder handles edit, but currently OrderEditModal does it.

    // Wrap handleSaveOrder to include onClose and onSaveSuccess
    const originalHandleSaveOrder = form.actions.handleSaveOrder;
    const handleSave = useCallback(async (e?: React.MouseEvent) => {
        e?.preventDefault();
        const success = await originalHandleSaveOrder(e);
        if (success) {
            onSaveSuccess();
            onClose();
        }
        return success;
    }, [originalHandleSaveOrder, onSaveSuccess, onClose]);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 bg-slate-900/40 backdrop-blur-[2px] animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-white w-full h-full md:w-[95vw] md:h-[95vh] rounded-none md:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-slide-up border-0 md:border md:border-white/20"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className={`px-8 py-6 border-b flex justify-between items-center transition-colors duration-300 ${isPickup ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg shadow-lg transition-colors duration-300 ${isPickup ? 'bg-emerald-600' : 'bg-blue-600'}`}>
                            <i className={`bi ${isPickup ? 'bi-hand-index-thumb-fill' : 'bi-truck'} text-white`} />
                        </div>
                        <div>
                            <h2 className={`text-xl font-black tracking-tight transition-colors duration-300 ${isPickup ? 'text-emerald-900' : 'text-slate-800'}`}>
                                {isPickup ? 'Novo Pedido de Retirada' : 'Novo Pedido de Entrega'}
                            </h2>
                            <p className={`text-[10px] uppercase font-black tracking-widest mt-0.5 transition-colors duration-300 ${isPickup ? 'text-emerald-700/60' : 'text-slate-400'}`}>
                                Preencha os detalhes abaixo para registrar uma nova {isPickup ? 'retirada' : 'venda e entrega'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <i className="bi bi-x-lg text-xl" />
                    </button>
                </div>

                {/* Modal Content - Internal Scroll handled by PdvFormSection */}
                <div className="flex-1 overflow-hidden bg-white dark:bg-slate-900">
                    <SalesOrderFormSection form={{
                        ...form,
                        actions: {
                            ...form.actions,
                            handleSaveOrder: handleSave
                        }
                    }} />
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}} />
        </div>
    );
};

export default NewSaleOrder;
