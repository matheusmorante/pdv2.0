import React from "react";

interface Filters {
    dateRange: { start: string; end: string };
    customerName: string;
    productName: string;
    valueRange: { min: number; max: number };
    sortBy: "date" | "customer";
    sortOrder: "asc" | "desc";
}

interface OrderFiltersProps {
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

const OrderFilters = ({ filters, setFilters }: OrderFiltersProps) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.includes(".")) {
            const [parent, child] = name.split(".");
            setFilters(prev => ({
                ...prev,
                [parent]: {
                    ...(prev[parent as keyof Filters] as any),
                    [child]: value
                }
            }));
        } else {
            setFilters(prev => ({ ...prev, [name]: value }));
        }
    };

    const resetFilters = () => {
        setFilters({
            dateRange: { start: "", end: "" },
            customerName: "",
            productName: "",
            valueRange: { min: 0, max: 1000000 },
            sortBy: "date",
            sortOrder: "desc"
        });
    };

    return (
        <aside className="w-full bg-white dark:bg-slate-900 flex flex-col h-full overflow-y-auto transition-colors">
            <div className="p-4 md:p-8 border-b border-slate-50 dark:border-slate-800">
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
                    <i className="bi bi-filter-left text-blue-600 dark:text-blue-500"></i>
                    Filtros
                </h3>
                <p className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest mt-1">Refine sua busca de pedidos</p>
            </div>

            <div className="p-8 flex flex-col gap-8">
                {/* Search Inputs */}
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Cliente</label>
                        <div className="relative">
                            <i className="bi bi-person absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600"></i>
                            <input
                                type="text"
                                name="customerName"
                                value={filters.customerName}
                                onChange={handleChange}
                                placeholder="Nome do cliente..."
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-slate-300 placeholder:text-slate-300 dark:placeholder:text-slate-700"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Produto</label>
                        <div className="relative">
                            <i className="bi bi-box absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600"></i>
                            <input
                                type="text"
                                name="productName"
                                value={filters.productName}
                                onChange={handleChange}
                                placeholder="Nome do produto..."
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-slate-300 placeholder:text-slate-300 dark:placeholder:text-slate-700"
                            />
                        </div>
                    </div>
                </div>

                {/* Date Range */}
                <div className="flex flex-col gap-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-300 border-b border-slate-50 dark:border-slate-800 pb-2">Período</h4>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Início</label>
                            <input
                                type="date"
                                name="dateRange.start"
                                value={filters.dateRange.start}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-slate-300"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Fim</label>
                            <input
                                type="date"
                                name="dateRange.end"
                                value={filters.dateRange.end}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-slate-300"
                            />
                        </div>
                    </div>
                </div>

                {/* Values and Sorting */}
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Valor Mínimo</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 text-xs font-bold">R$</span>
                            <input
                                type="number"
                                name="valueRange.min"
                                value={filters.valueRange.min}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-slate-300"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Ordenar por</label>
                        <select
                            name="sortBy"
                            value={filters.sortBy}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm appearance-none cursor-pointer dark:text-slate-300"
                        >
                            <option value="date" className="dark:bg-slate-900">📅 Data do Pedido</option>
                            <option value="customer" className="dark:bg-slate-900">👤 Nome do Cliente</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Direção</label>
                        <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <button
                                onClick={() => setFilters(prev => ({ ...prev, sortOrder: 'asc' }))}
                                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${filters.sortOrder === 'asc' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'}`}
                            >
                                Crescente
                            </button>
                            <button
                                onClick={() => setFilters(prev => ({ ...prev, sortOrder: 'desc' }))}
                                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${filters.sortOrder === 'desc' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'}`}
                            >
                                Decrescente
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-auto p-8 border-t border-slate-50 dark:border-slate-800">
                <button
                    onClick={resetFilters}
                    className="w-full py-4 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center justify-center gap-2"
                >
                    <i className="bi bi-arrow-counterclockwise"></i>
                    Limpar Filtros
                </button>
            </div>
        </aside>
    );
};

export default OrderFilters;
