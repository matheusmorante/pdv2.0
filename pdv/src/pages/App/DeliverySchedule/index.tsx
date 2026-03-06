import React from "react";
import { useLocation } from "react-router-dom";
import { useDeliverySchedule } from "./useDeliverySchedule";
import OrderDetailsModal from "./OrderDetailsModal";
import ScheduleCardView from "./ScheduleCardView/Index";
import ScheduleTableView from "./ScheduleTableView/Index";

const DeliverySchedule = () => {
    const {
        schedule,
        loading,
        viewMode,
        setViewMode,
        selectedOrder,
        openOrderDetails,
        closeOrderDetails,
        handleShare,
        handleDragEnd
    } = useDeliverySchedule();

    const location = useLocation();
    const isStandalone = location.pathname === "/schedule";

    const renderHeader = () => (
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 ${isStandalone ? 'bg-white p-6 rounded-3xl shadow-sm border border-slate-100' : ''}`}>
            <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200">
                    <i className="bi bi-calendar-week text-white text-xl" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
                        Cronograma de Entregas
                    </h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                        {isStandalone ? "Visualização em Tempo Real" : "Gestão de Logística"}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="flex bg-slate-200/50 p-1.5 rounded-xl shadow-inner flex-1 md:flex-none">
                    <button
                        onClick={() => setViewMode("card")}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-200 ${viewMode === "card"
                            ? "bg-white text-blue-600 shadow-md scale-105"
                            : "text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        <i className="bi bi-grid-fill mr-2" /> Cards
                    </button>
                    <button
                        onClick={() => setViewMode("table")}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-200 ${viewMode === "table"
                            ? "bg-white text-blue-600 shadow-md scale-105"
                            : "text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        <i className="bi bi-table mr-2" /> Tabela
                    </button>
                </div>

                {!isStandalone && (
                    <button
                        onClick={handleShare}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest py-3 px-6 rounded-xl shadow-lg shadow-emerald-100 flex items-center transition-all active:scale-95 group"
                    >
                        <i className="bi bi-whatsapp mr-2 text-lg group-hover:rotate-12 transition-transform" />
                        Compartilhar Link
                    </button>
                )}
            </div>
        </div>
    );

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center py-32">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="mt-6 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                        Sincronizando dados...
                    </p>
                </div>
            );
        }

        if (Object.keys(schedule).length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50 mx-4">
                    <div className="bg-white p-6 rounded-full shadow-sm mb-6">
                        <i className="bi bi-calendar-x text-5xl text-slate-200" />
                    </div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                        Nenhum agendamento para exibir
                    </p>
                </div>
            );
        }

        return (
            <div className="bg-white p-2 md:p-8 rounded-2xl">
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
            </div>
        );
    };

    return (
        <div className={`w-full mx-auto transition-all duration-300 ${isStandalone ? 'max-w-none p-4' : 'max-w-[1600px] mt-8 p-1 sm:p-4 md:p-8'}`}>
            {renderHeader()}

            <div className={`bg-white shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden ${isStandalone ? 'rounded-3xl' : 'rounded-[2.5rem]'}`}>
                {!isStandalone && (
                    <div className="p-1 md:p-2 bg-slate-50/50 border-b border-slate-100">
                        {/* Espaçador decorativo */}
                    </div>
                )}
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
                #schedule-capture-area {
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                }
            `}} />
        </div>
    );
};

export default DeliverySchedule;
