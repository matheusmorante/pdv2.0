import React from "react";
import { useLocation } from "react-router-dom";
import { useDeliverySchedule, ScheduleFilter } from "./useDeliverySchedule";
import OrderDetailsModal from "./OrderDetailsModal";
import ScheduleCardView from "./ScheduleCardView/Index";
import ScheduleTableView from "./ScheduleTableView/Index";

const DeliverySchedule = () => {
    const {
        schedule,
        loading,
        viewMode,
        setViewMode,
        filter,
        setFilter,
        selectedOrder,
        openOrderDetails,
        closeOrderDetails,
        handleShare,
        handleDragEnd
    } = useDeliverySchedule();

    const location = useLocation();
    const isStandalone = location.pathname.includes("/schedule") && !location.pathname.includes("/delivery-schedule");

    const filters: { id: ScheduleFilter; label: string; icon: string }[] = [
        { id: 'default', label: 'Ontem e Seguintes', icon: 'bi-calendar-check' },
        { id: 'week', label: 'Esta Semana', icon: 'bi-calendar-range' },
        { id: 'month', label: 'Este Mês', icon: 'bi-calendar-month' },
        { id: 'year', label: 'Este Ano', icon: 'bi-calendar3' },
        { id: 'all', label: 'Tudo', icon: 'bi-collection' },
    ];

    const renderHeader = () => (
        <div className={`flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8 ${isStandalone ? 'bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300' : ''}`}>
            <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-100 dark:shadow-blue-900/20">
                    <i className="bi bi-truck text-white text-2xl" />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none">
                        Cronograma de Entregas
                    </h2>
                    <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-[0.2em] mt-2">
                        {isStandalone ? "Visualização em Tempo Real" : "Gestão Logística v2.0"}
                    </p>
                </div>
            </div>

            {/* FILTERS TOOLBAR */}
            <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl gap-1 w-full sm:w-auto transition-colors duration-300">
                    {filters.map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f.id
                                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-100/50 dark:shadow-blue-900/20 scale-105"
                                : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50"
                                }`}
                        >
                            <i className={`bi ${f.icon} ${filter === f.id ? 'text-blue-500 dark:text-blue-400' : ''}`} />
                            <span className="inline">{f.label}</span>
                        </button>
                    ))}
                </div>

                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

                <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl gap-1 w-full sm:w-auto transition-colors duration-300">
                    <button
                        onClick={() => setViewMode("card")}
                        className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === "card"
                            ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-lg dark:shadow-blue-900/20"
                            : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                            }`}
                    >
                        <i className="bi bi-grid-fill mr-2" /> Cards
                    </button>
                    <button
                        onClick={() => setViewMode("table")}
                        className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === "table"
                            ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-lg dark:shadow-blue-900/20"
                            : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                            }`}
                    >
                        <i className="bi bi-table mr-2" /> Tabela
                    </button>
                </div>

                {!isStandalone && (
                    <button
                        onClick={handleShare}
                        className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest py-4 px-8 rounded-2xl shadow-xl shadow-emerald-100 dark:shadow-emerald-900/20 flex items-center justify-center transition-all active:scale-95 group"
                    >
                        <i className="bi bi-whatsapp mr-2 text-lg group-hover:rotate-12 transition-transform" />
                        Compartilhar
                    </button>
                )}
            </div>
        </div>
    );

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center py-40 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
                    <div className="relative w-20 h-20">
                        <div className="absolute inset-0 border-[6px] border-slate-50 dark:border-slate-800 rounded-full"></div>
                        <div className="absolute inset-0 border-[6px] border-blue-600 dark:border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="mt-8 text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">
                        Sincronizando Entregas...
                    </p>
                </div>
            );
        }

        if (Object.keys(schedule).length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] bg-slate-50/30 dark:bg-slate-950/30 mx-4 transition-colors duration-300">
                    <div className="bg-white dark:bg-slate-900 p-10 rounded-full shadow-2xl shadow-slate-100 dark:shadow-none mb-8 border border-slate-50 dark:border-slate-800">
                        <i className="bi bi-calendar-x text-6xl text-slate-200 dark:text-slate-800" />
                    </div>
                    <h3 className="text-slate-800 dark:text-slate-100 font-black text-xl mb-2">Nada por aqui!</h3>
                    <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                        Nenhum agendamento para o período selecionado
                    </p>
                    <button
                        onClick={() => setFilter('all')}
                        className="mt-8 text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-widest hover:underline"
                    >
                        Ver todos os agendamentos
                    </button>
                </div>
            );
        }

        return (
            <div className="transition-all duration-500 ease-in-out">
                {viewMode === "card" ? (
                    <ScheduleCardView
                        schedule={schedule}
                        handleDragEnd={handleDragEnd}
                        onOrderClick={openOrderDetails}
                    />
                ) : (
                    <ScheduleTableView
                        schedule={schedule}
                        onOrderClick={openOrderDetails}
                    />
                )}
            </div>
        );
    };

    return (
        <div className={`w-full mx-auto transition-all duration-300 ${isStandalone ? 'max-w-none p-4' : 'max-w-[1700px] mt-8 p-4 sm:p-6 md:p-10'}`}>
            {renderHeader()}

            <div className="relative">
                {renderContent()}
            </div>

            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={closeOrderDetails}
                />
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}} />
        </div>
    );
};

export default DeliverySchedule;
