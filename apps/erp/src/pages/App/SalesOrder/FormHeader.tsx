import React from "react";

interface FormHeaderProps {
    currentOrderId?: string;
    onClearForm: () => void;
    orderDate: string;
    setOrderDate: (date: string) => void;
}

const FormHeader = ({ currentOrderId, onClearForm, orderDate, setOrderDate }: FormHeaderProps) => (
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

        <div className="flex flex-col gap-2 order-1 md:order-2 md:text-right w-full md:w-auto">
            {currentOrderId ? (
                <>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                        Detalhes do Pedido
                    </h3>
                    <div className="flex flex-col md:items-end gap-1">
                        <p className="text-xs uppercase font-black text-slate-400 dark:text-slate-500 tracking-[0.2em]">
                            Pedido #{currentOrderId}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                            <i className="bi bi-calendar-event text-slate-400 dark:text-slate-500"></i>
                            <input
                                type="datetime-local"
                                value={orderDate}
                                onChange={(e) => setOrderDate(e.target.value)}
                                className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 w-fit"
                                title="Data e Hora da Venda"
                            />
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                        Novo Pedido
                    </h3>
                    <div className="flex items-center gap-2 mt-2 w-full md:justify-end">
                        <i className="bi bi-calendar-event text-slate-400 dark:text-slate-500"></i>
                        <input
                            type="datetime-local"
                            value={orderDate}
                            onChange={(e) => setOrderDate(e.target.value)}
                            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 w-fit"
                            title="Data e Hora da Venda"
                        />
                    </div>
                </>
            )}
        </div>
    </div>
);

export default FormHeader;
