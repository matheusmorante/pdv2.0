import React from "react";
import Order from "../../../types/pdvAction.type";
import { useOrderHistory } from "./useOrderHistory";
import OrderHistoryTable from "./OrderHistoryTable";

type OrderHistoryListProps = {
    onEdit: (order: Order) => void;
    filters?: any;
};

export type VisibilitySettings = {
    id: boolean;
    orderDate: boolean;
    deliveryDate: boolean;
    customer: boolean;
    totalValue: boolean;
    status: boolean;
    actions: boolean;
};

const OrderHistoryList = ({ onEdit, filters }: OrderHistoryListProps) => {
    const {
        orders,
        loading,
        handleDelete,
        handleAction,
        handleStatusUpdate,
        totalItems,
        currentPage,
        itemsPerPage,
        totalPages,
        setCurrentPage,
        setItemsPerPage
    } = useOrderHistory(filters);
    const [visibilitySettings, setVisibilitySettings] = React.useState<VisibilitySettings>({
        id: true,
        orderDate: true,
        deliveryDate: true,
        customer: true,
        totalValue: true,
        status: true,
        actions: true,
    });
    const [showSettings, setShowSettings] = React.useState(false);
    const [pageInput, setPageInput] = React.useState(currentPage.toString());

    React.useEffect(() => {
        setPageInput(currentPage.toString());
    }, [currentPage]);

    const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPageInput(e.target.value);
    };

    const handlePageInputBlur = () => {
        const val = parseInt(pageInput);
        if (!isNaN(val) && val >= 1 && val <= totalPages) {
            setCurrentPage(val);
        } else {
            setPageInput(currentPage.toString());
        }
    };

    const handlePageInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handlePageInputBlur();
        }
    };

    const getPageButtons = () => {
        const buttons = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            buttons.push(i);
        }
        return buttons;
    };

    const toggleVisibility = (column: keyof typeof visibilitySettings) => {
        setVisibilitySettings(prev => ({ ...prev, [column]: !prev[column] }));
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">
                        Carregando pedidos da nuvem...
                    </p>
                </div>
            );
        }

        if (orders.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                        <i className="bi bi-search text-3xl text-slate-200"></i>
                    </div>
                    <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">
                        Nenhum pedido encontrado
                    </p>
                </div>
            );
        }

        return (
            <div className="flex flex-col gap-6">
                <OrderHistoryTable
                    orders={orders}
                    onEdit={onEdit}
                    onDelete={handleDelete}
                    onAction={handleAction}
                    onStatusUpdate={handleStatusUpdate}
                    visibilitySettings={visibilitySettings}
                />

                {/* Pagination Controls */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-8 border-t border-slate-100 mt-4 px-2">
                    <div className="flex flex-wrap items-center justify-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${currentPage === 1 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600 bg-slate-50/50'}`}
                            title="Primeira Página"
                        >
                            <i className="bi bi-chevron-double-left text-sm" />
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${currentPage === 1 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600 bg-slate-50/50'}`}
                            title="Anterior"
                        >
                            <i className="bi bi-chevron-left text-sm" />
                        </button>

                        <div className="h-6 w-[1px] bg-slate-100 mx-2 hidden sm:block" />

                        <div className="flex gap-1 hidden sm:flex">
                            {getPageButtons().map(p => (
                                <button
                                    key={p}
                                    onClick={() => setCurrentPage(p)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-xs transition-all ${currentPage === p ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>

                        <div className="h-6 w-[1px] bg-slate-100 mx-2 hidden sm:block" />

                        <div className="flex items-center px-4 py-2 bg-slate-50/50 rounded-xl border border-slate-50">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2">Página</span>
                            <div className="flex items-center gap-1 group">
                                <input
                                    type="text"
                                    value={pageInput}
                                    onChange={handlePageInputChange}
                                    onBlur={handlePageInputBlur}
                                    onKeyDown={handlePageInputKeyDown}
                                    className="w-12 px-2 py-1 text-xs font-black text-blue-600 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 text-center shadow-sm transition-all"
                                />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mx-1">de</span>
                                <span className="text-xs font-black text-slate-800">{totalPages || 1}</span>
                            </div>
                        </div>

                        <div className="h-6 w-[1px] bg-slate-100 mx-2 hidden sm:block" />

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${currentPage === totalPages || totalPages === 0 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600 bg-slate-50/50'}`}
                            title="Próxima"
                        >
                            <i className="bi bi-chevron-right text-sm" />
                        </button>
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${currentPage === totalPages || totalPages === 0 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600 bg-slate-50/50'}`}
                            title="Última Página"
                        >
                            <i className="bi bi-chevron-double-right text-sm" />
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-6">
                        <div className="px-4 py-2 bg-blue-50 rounded-xl border border-blue-100">
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                                Total: <span className="text-blue-700 font-black">{totalItems}</span> {totalItems === 1 ? 'pedido' : 'pedidos'}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Exibir</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1 text-xs font-black text-slate-700 focus:outline-none transition-all cursor-pointer"
                            >
                                {[10, 25, 50].map(size => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">por página</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full flex flex-col gap-4">
            <div className="flex justify-end relative">
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm font-bold text-xs uppercase tracking-widest"
                >
                    <i className={`bi ${showSettings ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                    Vizualização
                </button>

                {showSettings && (
                    <>
                        <div className="fixed inset-0 z-30" onClick={() => setShowSettings(false)} />
                        <div className="absolute top-[calc(100%+8px)] right-0 w-64 bg-white border border-slate-100 rounded-2xl shadow-xl p-4 flex flex-col gap-3 z-40 animate-slide-up">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Colunas da Tabela</h4>
                            <div className="grid grid-cols-1 gap-2">
                                {[
                                    { key: 'id', label: 'ID do Pedido' },
                                    { key: 'orderDate', label: 'Data do Pedido' },
                                    { key: 'deliveryDate', label: 'Data de Entrega' },
                                    { key: 'customer', label: 'Cliente' },
                                    { key: 'totalValue', label: 'Valor Total' },
                                    { key: 'status', label: 'Status' },
                                    { key: 'actions', label: 'Ações' },
                                ].map((col) => (
                                    <button
                                        key={col.key}
                                        onClick={() => toggleVisibility(col.key as keyof typeof visibilitySettings)}
                                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-all group"
                                    >
                                        <span className={`text-[11px] font-bold ${visibilitySettings[col.key as keyof typeof visibilitySettings] ? 'text-slate-700' : 'text-slate-300'}`}>
                                            {col.label}
                                        </span>
                                        <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${visibilitySettings[col.key as keyof typeof visibilitySettings] ? 'bg-blue-600' : 'bg-slate-200'}`}>
                                            <div className={`w-3 h-3 bg-white rounded-full transition-transform ${visibilitySettings[col.key as keyof typeof visibilitySettings] ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
            {renderContent()}
        </div>
    );
};

export default OrderHistoryList;
