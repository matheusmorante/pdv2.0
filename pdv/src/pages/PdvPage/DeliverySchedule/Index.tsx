import React from "react";
import { useDeliverySchedule } from "./useDeliverySchedule";
import ScheduleCardView from "./ScheduleCardView/Index";
import ScheduleTableView from "./ScheduleTableView/Index";

const DeliverySchedule = () => {
    const {
        schedule,
        loading,
        viewMode,
        setViewMode,
        scheduleRef,
        handleShare,
        handleDragEnd
    } = useDeliverySchedule();

    const renderHeader = () => (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200">
                    <i className="bi bi-calendar-week text-white text-xl" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
                        Cronograma
                    </h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                        Gestão de Entregas
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

                <button
                    onClick={handleShare}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest py-3 px-6 rounded-xl shadow-lg shadow-emerald-100 flex items-center transition-all active:scale-95 group"
                >
                    <i className="bi bi-whatsapp mr-2 text-lg group-hover:rotate-12 transition-transform" />
                    Compartilhar
                </button>
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
                <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
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
            <div
                ref={scheduleRef}
                className="bg-white p-2 md:p-8 rounded-2xl"
                id="schedule-capture-area"
            >
                {/* Header exclusivo para exportação de imagem */}
                <div className="hidden visible-on-capture text-center mb-12 pb-8 border-b-4 border-double border-slate-100">
                    <div className="inline-block bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                        Relatório de Logística
                    </div>
                    <h1 className="text-4xl font-black uppercase text-slate-900 tracking-tighter mb-2">
                        Cronograma de Entregas
                    </h1>
                    <div className="flex justify-center items-center gap-6 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-2">
                            <i className="bi bi-clock" /> {new Date().toLocaleString('pt-BR')}
                        </span>
                        <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                        <span className="flex items-center gap-2">
                            <i className="bi bi-layers" /> Visão: {viewMode === 'card' ? 'Listagem' : 'Grade Horária'}
                        </span>
                    </div>
                </div>

                <div className="transition-all duration-500 ease-in-out">
                    {viewMode === "card" ? (
                        <ScheduleCardView schedule={schedule} handleDragEnd={handleDragEnd} />
                    ) : (
                        <ScheduleTableView schedule={schedule} />
                    )}
                </div>

                {/* Footer exclusivo para exportação */}
                <div className="hidden visible-on-capture mt-12 pt-8 border-t border-slate-100 text-center">
                    <p className="text-slate-300 text-[9px] font-black uppercase tracking-[0.2em]">
                        Sistema PDV - Gestão Inteligente de Pedidos
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-[1600px] mx-auto mt-8 p-1 sm:p-4 md:p-8">
            {renderHeader()}
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-1 md:p-2 bg-slate-50/50 border-b border-slate-100">
                    {/* Espaçador decorativo */}
                </div>
                {renderContent()}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media screen {
                    .visible-on-capture { display: none !important; }
                }
                #schedule-capture-area {
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                }
            `}} />
        </div>
    );
};

export default DeliverySchedule;
