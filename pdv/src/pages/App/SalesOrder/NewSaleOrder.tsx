import React, { useCallback } from "react";
import PdvFormSection from "./PdvFormSection";
import { usePdvForm } from "./usePdvForm";

interface NewSaleOrderProps {
    onClose: () => void;
    onSaveSuccess: () => void;
}

const NewSaleOrder = ({ onClose, onSaveSuccess }: NewSaleOrderProps) => {
    const form = usePdvForm();

    // Wrap handleSaveOrder to include onClose and onSaveSuccess
    const originalHandleSaveOrder = form.actions.handleSaveOrder;
    const handleSave = useCallback(async (e?: React.MouseEvent) => {
        e?.preventDefault();
        await originalHandleSaveOrder(e);
        onSaveSuccess();
        onClose();
    }, [originalHandleSaveOrder, onSaveSuccess, onClose]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-[2px] animate-fade-in">
            <div className="bg-white w-full max-w-[95vw] h-[95vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-slide-up border border-white/20">
                {/* Modal Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-4">
                        <div className="bg-green-600 p-2 rounded-lg shadow-lg">
                            <i className="bi bi-plus-lg text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Novo Pedido de Venda</h2>
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mt-0.5">
                                Preencha os detalhes abaixo para registrar uma nova venda
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
                    <PdvFormSection form={{
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
