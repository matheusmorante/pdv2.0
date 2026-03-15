import React from "react";

interface AssistanceOrderHeaderProps {
    isEditing: boolean;
    onClose: () => void;
}

const AssistanceOrderHeader = ({ isEditing, onClose }: AssistanceOrderHeaderProps) => (
    <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-amber-50 dark:bg-amber-900/10 shrink-0">
        <div className="flex items-center gap-4">
            <div className="bg-amber-500 p-2.5 rounded-2xl shadow-lg shadow-amber-200 dark:shadow-amber-900/30">
                <i className="bi bi-tools text-white text-xl" />
            </div>
            <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                    {isEditing ? "Editar Assistência" : "Novo Pedido de Assistência"}
                </h2>
                <p className="text-[10px] uppercase font-black text-amber-600 dark:text-amber-400 tracking-widest mt-0.5">
                    Atendimento / Serviço Técnico
                </p>
            </div>
        </div>
        <button
            onClick={onClose}
            className="p-2 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-full transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
            <i className="bi bi-x-lg text-xl" />
        </button>
    </div>
);

export default AssistanceOrderHeader;
