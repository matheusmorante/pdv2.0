import React from "react";
import Order from "../../types/pdvAction.type";
import ModalHeader from "./OrderDetailsModalComponents/ModalHeader";
import { CustomerSection, ShippingSection, SchedulingSection } from "./OrderDetailsModalComponents/CustomerShippingInfo";
import { ItemsTable, FinancialSummary } from "./OrderDetailsModalComponents/ItemsFinancialInfo";

interface Props {
    order: Order;
    onClose: () => void;
}

const OrderDetailsModal = ({ order, onClose }: Props) => {
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-slide-up border border-slate-100">
                <ModalHeader
                    reference={order.id?.slice(-8).toUpperCase() || "N/A"}
                    onClose={onClose}
                />

                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Left Column: Customer & Shipping */}
                        <div className="space-y-10">
                            <CustomerSection
                                fullName={order.customerData?.fullName}
                                phone={order.customerData?.phone}
                            />
                            <ShippingSection
                                fullAddress={order.customerData?.fullAddress}
                            />
                            <SchedulingSection
                                scheduling={order.shipping?.scheduling}
                            />
                        </div>

                        {/* Right Column: Items & Summary */}
                        <div className="space-y-10">
                            <ItemsTable items={order.items || []} />
                            <FinancialSummary
                                itemsSummary={order.itemsSummary}
                                shippingValue={order.shipping?.value || 0}
                                totalValue={order.paymentsSummary?.totalOrderValue || 0}
                            />
                        </div>
                    </div>

                    {order.observation && (
                        <div className="mt-12 p-8 bg-amber-50/50 border border-amber-100 rounded-[2rem]">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-3 flex items-center gap-2">
                                <i className="bi bi-chat-left-dots-fill" /> Observações Internas
                            </h4>
                            <p className="text-sm font-bold text-amber-900/70 italic leading-relaxed">
                                "{order.observation}"
                            </p>
                        </div>
                    )}
                </div>

                <div className="px-10 py-6 border-t border-slate-100 bg-slate-50 flex justify-center">
                    <p className="text-[9px] font-black uppercase text-slate-300 tracking-[0.3em]">
                        Sistema PDV Inteligente • Logística v2.0
                    </p>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slide-up { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}} />
        </div>
    );
};

export default OrderDetailsModal;
