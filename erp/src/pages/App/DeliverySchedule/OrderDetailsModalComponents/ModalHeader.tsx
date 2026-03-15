import React from "react";

interface Props {
    reference: string;
    onClose: () => void;
    onEdit?: () => void;
}

const ModalHeader = ({ reference, onClose, onEdit }: Props) => (
    <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20 transition-colors duration-300">
        <div className="flex items-center gap-5">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-100 dark:shadow-blue-900/20">
                <i className="bi bi-receipt text-white text-xl" />
            </div>
            <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Detalhes do Pedido</h2>
                <p className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest mt-1">
                    Referência: {reference}
                </p>
            </div>
        </div>
        <div className="flex items-center gap-3">
            {onEdit && (
                <button
                    onClick={onEdit}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl transition-all shadow-sm border border-blue-100 dark:border-blue-800 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-100 dark:hover:bg-blue-900/60"
                >
                    <i className="bi bi-pencil-fill" />
                    Editar
                </button>
            )}
            <button
                onClick={onClose}
                className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 rounded-2xl transition-all shadow-sm border border-slate-100 dark:border-slate-700 active:scale-95"
            >
                <i className="bi bi-x-lg text-lg" />
            </button>
        </div>
    </div>
);

export default ModalHeader;
