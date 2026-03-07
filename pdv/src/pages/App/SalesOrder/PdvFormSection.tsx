import React from "react";
import ItemsTable from "./ItemsTable";
import Seller from "./Seller";
import ShippingInputs from "./ShippingData";
import PaymentsTable from "./PaymentsTable/Index";
import PersonalInfos from "./CustomerData";
import FormHeader from "./FormHeader";
import FormFooter from "./FormFooter";
import SectionCard from "../../../components/SectionCard";
import { useSalesOrderForm } from "./useSalesOrderForm";

type SalesOrderFormSectionProps = {
    form: ReturnType<typeof useSalesOrderForm>;
};

const SalesOrderFormSection = ({ form }: SalesOrderFormSectionProps) => {
    const { state, actions } = form;

    return (
        <form
            className="flex flex-col w-full h-full bg-white dark:bg-slate-900 relative transition-colors duration-300 overflow-hidden"
            onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
        >
            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-0 custom-scrollbar">
                <FormHeader
                    currentOrderId={state.currentOrderId}
                    onClearForm={actions.clearForm}
                />

                {/* Main Form Content */}
                <div className="grid grid-cols-1 xl:grid-cols-3 2xl:grid-cols-4 gap-4 items-start pb-10">
                    {/* Left Column - Items & Payments */}
                    <div className="xl:col-span-2 2xl:col-span-3 flex flex-col gap-4">
                        <SectionCard
                            icon="bi bi-box-seam"
                            iconBg="bg-blue-600 shadow-blue-100 dark:shadow-blue-900/20"
                            title="Itens do Pedido"
                            subtitle="Produtos e serviços selecionados"
                        >
                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-x-auto shadow-sm transition-colors duration-300">
                                <ItemsTable
                                    items={state.items}
                                    setItems={actions.setItems}
                                    summary={state.itemsSummary}
                                    deliveryMethod={state.shipping.deliveryMethod}
                                    errors={state.errors}
                                />
                            </div>
                        </SectionCard>

                        <SectionCard
                            icon="bi bi-credit-card-2-front"
                            iconBg="bg-indigo-600 shadow-indigo-100 dark:shadow-indigo-900/20"
                            title="Condições de Pagamento"
                            subtitle="Formas e prazos acordados"
                        >
                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-x-auto shadow-sm transition-colors duration-300">
                                <PaymentsTable
                                    payments={state.payments}
                                    setPayments={actions.setPayments}
                                    summary={state.paymentsSummary}
                                />
                            </div>
                        </SectionCard>
                    </div>

                    {/* Right Column - Customer & Shipping */}
                    <div className="flex flex-col gap-4">
                        <SectionCard
                            icon="bi bi-person-badge"
                            iconBg="bg-purple-600 shadow-purple-100 dark:shadow-purple-900/20"
                            title="Dados do Cliente"
                            className="bg-white dark:bg-slate-900"
                        >
                            <PersonalInfos
                                customerData={state.customerData}
                                setCustomerData={actions.setCustomerData}
                                errors={state.errors}
                            />
                        </SectionCard>

                        <SectionCard
                            icon="bi bi-truck"
                            iconBg="bg-orange-500 shadow-orange-100 dark:shadow-orange-900/20"
                            title="Entrega"
                            className="bg-white dark:bg-slate-900"
                        >
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
                        </SectionCard>

                        <SectionCard
                            icon="bi bi-card-text"
                            iconBg="bg-slate-600 shadow-slate-100 dark:shadow-slate-800/50"
                            title="Observações"
                            className="bg-white dark:bg-slate-900"
                        >
                            <textarea
                                value={state.observation}
                                onChange={(e) => actions.setObservation(e.target.value)}
                                className="w-full min-h-[120px] bg-transparent border-0 border-b border-slate-200 dark:border-slate-800 p-2 text-slate-700 dark:text-slate-300 focus:border-blue-600 dark:focus:border-blue-500 outline-none transition-all resize-none text-sm placeholder:text-slate-300 dark:placeholder:text-slate-700 font-medium"
                                placeholder="Notas importantes deste pedido..."
                            />
                        </SectionCard>
                    </div>
                </div>
            </div>

            {/* Fixed Footer */}
            <FormFooter
                currentOrder={state.currentOrder}
                totalOrderValue={state.paymentsSummary.totalOrderValue}
                isSaving={state.isSaving}
                onCompleteOrder={actions.handleCompleteOrder}
            />

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

export default SalesOrderFormSection;
