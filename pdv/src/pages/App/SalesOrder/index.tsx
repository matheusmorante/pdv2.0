import React, { useState } from "react";
import OrderHistoryList from "./OrderHistoryList";
import OrderEditModal from "./OrderEditModal";
import NewSaleOrder from "./NewSaleOrder";
import Order from "../../types/pdvAction.type";
import OrderFilters from "./OrderFilters";

const SalesOrder = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [filters, setFilters] = useState({
        dateRange: { start: "", end: "" },
        customerName: "",
        productName: "",
        valueRange: { min: 0, max: 1000000 },
        sortBy: "date" as "date" | "customer",
        sortOrder: "desc" as "asc" | "desc"
    });

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex -m-8 h-[calc(100vh-80px)] overflow-hidden bg-slate-50">
            {/* Sidebar for Filters */}
            <div className={`transition-all duration-300 ease-in-out border-r border-slate-100 bg-white ${isSidebarOpen ? 'w-80' : 'w-0 overflow-hidden border-none'}`}>
                <OrderFilters filters={filters} setFilters={setFilters} />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-10">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all shadow-lg font-black uppercase tracking-widest text-[10px] border ${isSidebarOpen
                                ? 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50 shadow-slate-200/50'
                                : 'bg-blue-600 text-white border-blue-500 shadow-blue-200'
                                }`}
                            title={isSidebarOpen ? "Fechar Filtros" : "Abrir Filtros"}
                        >
                            <i className={`bi ${isSidebarOpen ? 'bi-sliders' : 'bi-funnel'} text-lg`} />
                            {!isSidebarOpen && <span>Filtros</span>}
                        </button>
                        <div>
                            <h1 className="text-4xl font-black text-slate-800 tracking-tight">Pedidos de Venda</h1>
                            <p className="text-slate-500 font-medium text-lg">Gerencie e acompanhe todos os pedidos realizados</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-200 transition-all active:scale-95"
                    >
                        <i className="bi bi-plus-lg text-xl" />
                        Novo Pedido
                    </button>
                </div>

                <div className="flex flex-col gap-8">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100">
                        <OrderHistoryList
                            onEdit={setEditingOrder}
                            filters={filters}
                        />
                    </div>
                </div>
            </div>

            {isAddModalOpen && (
                <NewSaleOrder
                    onClose={() => setIsAddModalOpen(false)}
                    onSaveSuccess={() => { }}
                />
            )}

            {editingOrder && (
                <OrderEditModal
                    order={editingOrder}
                    onClose={() => setEditingOrder(null)}
                    onSaveSuccess={() => { }}
                />
            )}
        </div>
    );
};

export default SalesOrder;