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
            className="flex flex-col w-full h-full bg-white dark:bg-slate-900 relative transition-colors duration-300 overflow-hidden"
            onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
        >
            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-0 custom-scrollbar">
                {/* Header / Actions Row */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b border-slate-100 dark:border-slate-800 mb-10 pt-8">
                    <div className="flex flex-wrap items-end gap-6 w-full md:w-auto order-2 md:order-1">
                        {/* Delivery Method Toggle */}
                        <div className="flex flex-col">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1">Modalidade</label>
                            <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-2xl w-fit border border-slate-200 dark:border-slate-800">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        actions.setShipping(prev => ({
                                            ...prev,
                                            deliveryMethod: 'delivery',
                                        }));
                                    }}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${state.shipping.deliveryMethod === 'delivery'
                                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                        }`}
                                >
                                    Entrega
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        actions.setShipping(prev => ({
                                            ...prev,
                                            deliveryMethod: 'pickup',
                                        }));
                                    }}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${state.shipping.deliveryMethod === 'pickup'
                                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                        }`}
                                >
                                    Retirada
                                </button>
                            </div>
                        </div>

                        {state.currentOrderId && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    actions.clearForm();
                                }}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl transition-all font-black text-xs uppercase tracking-widest border border-slate-200 dark:border-slate-700 h-[42px]"
                            >
                                <i className="bi bi-plus-circle" /> Novo Pedido
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col gap-1 order-1 md:order-2 md:text-right">
                        {state.currentOrderId && (
                            <>
                                <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                                    Detalhes do Pedido
                                </h3>
                                <p className="text-xs uppercase font-black text-slate-400 dark:text-slate-500 tracking-[0.2em]">
                                    Pedido #{state.currentOrderId}
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* Main Form Content - Wide Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-10 items-start pb-10">

                    {/* Left Column - Main Tables (Items & Payments) */}
                    <div className="lg:col-span-2 2xl:col-span-3 flex flex-col gap-10">
                        {/* Items Section */}
                        <section className="bg-slate-50/50 dark:bg-slate-800/20 rounded-[2.5rem] p-4 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 dark:shadow-blue-900/20">
                                    <i className="bi bi-box-seam text-white text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Itens do Pedido</h3>
                                    <p className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest">Produtos e serviços selecionados</p>
                                </div>
                            </div>

                            <ItemsTable
                                items={state.items}
                                setItems={actions.setItems}
                                summary={state.itemsSummary}
                                deliveryMethod={state.shipping.deliveryMethod}
                                errors={state.errors}
                            />
                        </section>

                        {/* Payments Section */}
                        <section className="bg-slate-50/50 dark:bg-slate-800/20 rounded-[2.5rem] p-4 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20">
                                    <i className="bi bi-credit-card-2-front text-white text-xl"></i>
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Condições de Pagamento</h4>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Formas e prazos acordados</p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-x-auto shadow-sm">
                                <PaymentsTable
                                    payments={state.payments}
                                    setPayments={actions.setPayments}
                                    summary={state.paymentsSummary}
                                />
                            </div>
                        </section>
                    </div>

                    {/* Right Column - Customer & Shipping Info */}
                    <div className="flex flex-col gap-10">
                        {/* Customer Info */}
                        <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-100 dark:shadow-purple-900/20">
                                    <i className="bi bi-person-badge text-white text-xl"></i>
                                </div>
                                <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Dados do Cliente</h4>
                            </div>
                            <PersonalInfos
                                customerData={state.customerData}
                                setCustomerData={actions.setCustomerData}
                                errors={state.errors}
                            />
                        </section>

                        {/* Shipping & Delivery */}
                        <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-100 dark:shadow-orange-900/20">
                                    <i className="bi bi-truck text-white text-xl"></i>
                                </div>
                                <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Entrega</h4>
                            </div>
                            <div className="space-y-8">
                                <Seller
                                    seller={state.seller}
                                    setSeller={actions.setSeller}
                                    errors={state.errors}
                                />
                                <ShippingInputs
                                    shipping={state.shipping}
                                    setShipping={actions.setShipping}
                                    customerData={state.customerData}
                                    errors={state.errors}
                                />
                            </div>
                        </section>

                        {/* Observations */}
                        <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-slate-600 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-100 dark:shadow-slate-800/50">
                                    <i className="bi bi-card-text text-white text-xl"></i>
                                </div>
                                <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Observações</h4>
                            </div>
                            <textarea
                                value={state.observation}
                                onChange={(e) => actions.setObservation(e.target.value)}
                                className="w-full min-h-[120px] bg-transparent border-0 border-b border-slate-200 dark:border-slate-800 p-2 text-slate-600 dark:text-slate-400 focus:border-blue-600 dark:focus:border-blue-500 outline-none transition-all resize-none text-sm placeholder:text-slate-300 dark:placeholder:text-slate-700"
                                placeholder="Notas importantes deste pedido..."
                            />
                        </section>
                    </div>
                </div>
            </div>

            {/* FIXED FOOTER FOR ACTIONS */}
            <div className="border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md py-4 px-8 transition-colors duration-300 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)] dark:shadow-none shrink-0">
                <div className="max-w-[1400px] mx-auto">
                    <div className="bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-4 px-6 md:px-8 rounded-3xl shadow-sm flex flex-row items-center justify-between gap-6 transition-colors duration-300">
                        <div className="flex-1">
                            <PdvActions order={state.currentOrder} />
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="bg-white dark:bg-slate-900 p-3 px-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-end transition-colors duration-300">
                                <span className="text-slate-400 dark:text-slate-500 text-[8px] font-black uppercase tracking-widest">Total a Receber</span>
                                <span className="text-blue-600 dark:text-blue-400 font-black text-2xl italic tracking-tighter">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(state.paymentsSummary.totalOrderValue || 0)}
                                </span>
                            </div>

                            <button
                                onClick={(e) => { e.preventDefault(); actions.handleCompleteOrder(e as any); }}
                                disabled={state.isSaving}
                                className={`flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl transition-all active:scale-95 whitespace-nowrap ${state.isSaving
                                    ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none"
                                    : "bg-green-600 hover:bg-green-700 text-white shadow-green-200 dark:shadow-green-900/20 shadow-lg"
                                    }`}
                            >
                                {state.isSaving ? (
                                    <>
                                        <i className="bi bi-arrow-repeat animate-spin text-xl" />
                                        Processando...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check2-circle text-lg" />
                                        Finalizar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
                
                input:focus { border-color: #3b82f6 !important; }
            `}} />
        </form>
    );
};

export default PdvFormSection;
