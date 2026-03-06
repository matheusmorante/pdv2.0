import React from "react";
import ItemsTable from "./ItemsTable";
import Seller from "./Seller";
import ShippingInputs from "./ShippingData";
import PaymentsTable from "./PaymentsTable/Index";
import PersonalInfos from "./CustomerData";
import PdvActions from "./PdvActions/Index";
import { usePdvForm } from "./usePdvForm";

type PdvFormSectionProps = {
    form: ReturnType<typeof usePdvForm>;
};

const PdvFormSection = ({ form }: PdvFormSectionProps) => {
    const { state, actions } = form;

    return (
        <form
            className="flex flex-col w-full bg-white relative"
            onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
        >
            {/* Header / Actions Row */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b border-slate-100 mb-10">
                <div className="flex flex-col gap-1">
                    <h3 className="text-3xl font-black text-slate-800 tracking-tight">
                        {state.currentOrderId ? "Detalhes do Pedido" : "Novo Lançamento"}
                    </h3>
                    <p className="text-xs uppercase font-black text-slate-400 tracking-[0.2em]">
                        {state.currentOrderId ? `Pedido #${state.currentOrderId}` : "O progresso é salvo automaticamente como rascunho"}
                    </p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    {state.currentOrderId && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                actions.clearForm();
                            }}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition-all font-black text-xs uppercase tracking-widest border border-slate-200"
                        >
                            <i className="bi bi-plus-circle" /> Novo Pedido
                        </button>
                    )}
                </div>
            </div>

            {/* Main Form Content - Wide Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-10 items-stretch">

                {/* Left Column - Main Tables (Items & Payments) */}
                <div className="lg:col-span-2 2xl:col-span-3 flex flex-col gap-10">
                    {/* Items Section */}
                    <section className="bg-slate-50/50 rounded-[2.5rem] p-4 md:p-8 border border-slate-100 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                                <i className="bi bi-cart3 text-white text-xl"></i>
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Itens do Pedido</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Produtos e Serviços selecionados</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-3xl border border-slate-100 overflow-x-auto shadow-sm">
                            <ItemsTable
                                items={state.items}
                                setItems={actions.setItems}
                                summary={state.itemsSummary}
                            />
                        </div>
                    </section>

                    {/* Payments Section */}
                    <section className="bg-slate-50/50 rounded-[2.5rem] p-4 md:p-8 border border-slate-100 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                                <i className="bi bi-credit-card-2-front text-white text-xl"></i>
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Condições de Pagamento</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Formas e prazos acordados</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-3xl border border-slate-100 overflow-x-auto shadow-sm">
                            <PaymentsTable
                                payments={state.payments}
                                setPayments={actions.setPayments}
                                summary={state.paymentsSummary}
                            />
                        </div>
                    </section>
                </div>

                {/* Right Column - Customer & Shipping Info - MATCHED HEIGHT WITH SCROLL */}
                <div className="flex flex-col gap-10 h-full max-h-[1400px]"> {/* Altura máxima generosa para desktop */}
                    <div className="flex-1 flex flex-col gap-10 overflow-y-auto pr-2 custom-scrollbar lg:max-h-[1200px]">
                        {/* Customer Info */}
                        <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm shrink-0">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-100">
                                    <i className="bi bi-person-badge text-white text-xl"></i>
                                </div>
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Dados do Cliente</h4>
                            </div>
                            <PersonalInfos
                                customerData={state.customerData}
                                setCustomerData={actions.setCustomerData}
                            />
                        </section>

                        {/* Shipping & Delivery */}
                        <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm shrink-0">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-100">
                                    <i className="bi bi-truck text-white text-xl"></i>
                                </div>
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Entrega</h4>
                            </div>
                            <div className="space-y-8">
                                <Seller seller={state.seller} setSeller={actions.setSeller} />
                                <ShippingInputs
                                    shipping={state.shipping}
                                    setShipping={actions.setShipping}
                                    customerData={state.customerData}
                                />
                            </div>
                        </section>

                        {/* Observations */}
                        <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm shrink-0">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-slate-600 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-100">
                                    <i className="bi bi-card-text text-white text-xl"></i>
                                </div>
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Observações</h4>
                            </div>
                            <textarea
                                value={state.observation}
                                onChange={(e) => actions.setObservation(e.target.value)}
                                className="w-full min-h-[140px] bg-slate-50 border border-slate-100 p-4 text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all rounded-3xl resize-none text-sm placeholder:text-slate-300"
                                placeholder="Notas importantes deste pedido..."
                            />
                        </section>
                    </div>
                </div>
            </div>

            {/* CLEAN WHITE NON-FIXED FOOTER FOR ACTIONS */}
            <div className="mt-16 pt-10 border-t border-slate-100 bg-white pb-10">
                <div className="max-w-[1400px] mx-auto">
                    <div className="bg-slate-50 border border-slate-100 p-10 rounded-[3rem] shadow-sm flex flex-col items-center justify-between gap-8 md:flex-row">
                        <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
                            <span className="text-slate-900 font-black text-2xl tracking-tight">Finalizar Pedido</span>
                            <p className="text-slate-400 text-xs uppercase font-black tracking-widest">Selecione uma ação rápida para concluir</p>
                        </div>

                        <div className="flex-1 max-w-xl px-4">
                            <PdvActions order={state.currentOrder} />
                        </div>

                        <div className="flex flex-col items-end gap-6 min-w-[320px]">
                            <div className="bg-white p-6 px-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-end w-full">
                                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total a Receber</span>
                                <span className="text-blue-600 font-black text-4xl italic tracking-tighter">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(state.paymentsSummary.totalOrderValue || 0)}
                                </span>
                            </div>

                            <button
                                onClick={(e) => { e.preventDefault(); actions.handleCompleteOrder(e as any); }}
                                disabled={state.isSaving || !state.isValidForCompletion}
                                className={`w-full flex items-center justify-center gap-3 px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl transition-all active:scale-95 ${state.isSaving || !state.isValidForCompletion
                                    ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                                    : "bg-green-600 hover:bg-green-700 text-white shadow-green-200 shadow-lg"
                                    }`}
                            >
                                {state.isSaving ? (
                                    <>
                                        <i className="bi bi-arrow-repeat animate-spin text-xl" />
                                        Processando...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check2-circle text-xl" />
                                        Finalizar Pedido
                                    </>
                                )}
                            </button>

                            {!state.isValidForCompletion && (
                                <p className="text-orange-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
                                    Preencha todos os campos obrigatórios
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
                
                input:focus { border-color: #3b82f6 !important; }
            `}} />
        </form>
    );
};

export default PdvFormSection;
