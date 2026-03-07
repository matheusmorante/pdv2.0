import React from "react";

interface FormHeaderProps {
    currentOrderId?: string;
    onClearForm: () => void;
}

const FormHeader = ({ currentOrderId, onClearForm }: FormHeaderProps) => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b border-slate-100 dark:border-slate-800 mb-10 pt-8">
        <div className="flex flex-wrap items-end gap-6 w-full md:w-auto order-2 md:order-1">
            {currentOrderId && (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onClearForm();
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl transition-all font-black text-xs uppercase tracking-widest border border-slate-200 dark:border-slate-700 h-[42px]"
                    title="Limpar formulário e iniciar novo pedido"
                >
                    <i className="bi bi-plus-circle" /> Novo Pedido
                </button>
            )}
        </div>

        <div className="flex flex-col gap-1 order-1 md:order-2 md:text-right">
            {currentOrderId && (
                <>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                        Detalhes do Pedido
                    </h3>
                    <p className="text-xs uppercase font-black text-slate-400 dark:text-slate-500 tracking-[0.2em]">
                        Pedido #{currentOrderId}
                    </p>
                </>
            )}
        </div>
    </div>
);

export default FormHeader;
