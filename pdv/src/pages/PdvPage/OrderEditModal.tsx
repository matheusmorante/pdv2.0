import React, { useState } from "react";
import Order from "../types/pdvAction.type";
import { updateOrder } from "../utils/orderHistoryService";
import { toast } from "react-toastify";
import CustomerDataInputs from "./CustomerData";
import ItemsTable from "./ItemsTable/Index";
import PaymentsTable from "./PaymentsTable/Index";
import ShippingData from "./ShippingData";
import { calcPaymentsSummary } from "../utils/calculations";
import { calcItemsSummary } from "./pdvUtils";

interface Props {
    order: Order;
    onClose: () => void;
    onSaveSuccess: () => void;
}

const OrderEditModal = ({ order: initialOrder, onClose, onSaveSuccess }: Props) => {
    const [order, setOrder] = useState<Order>({ ...initialOrder });
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateOrder(order);
            toast.success("Pedido atualizado com sucesso!");
            onSaveSuccess();
            onClose();
        } catch (error) {
            console.error("Erro ao atualizar pedido:", error);
            toast.error("Falha ao atualizar pedido.");
        } finally {
            setIsSaving(false);
        }
    };

    // Helper to update specific parts of the order with reactive summaries
    const updateCustomerData = (customerData: any) => setOrder(prev => ({ ...prev, customerData }));

    const updateItems = (items: any) => {
        const itemsSummary = calcItemsSummary(items);
        const paymentsSummary = calcPaymentsSummary(order.payments, itemsSummary, order.shipping.value);
        setOrder(prev => ({ ...prev, items, itemsSummary, paymentsSummary }));
    };

    const updatePayments = (payments: any) => {
        const paymentsSummary = calcPaymentsSummary(payments, order.itemsSummary, order.shipping.value);
        setOrder(prev => ({ ...prev, payments, paymentsSummary }));
    };

    const updateShipping = (shipping: any) => {
        const paymentsSummary = calcPaymentsSummary(order.payments, order.itemsSummary, shipping.value);
        setOrder(prev => ({ ...prev, shipping, paymentsSummary }));
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-slide-up">
                {/* Modal Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-600 p-2 rounded-lg shadow-lg">
                            <i className="bi bi-pencil-square text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Editar Pedido</h2>
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mt-0.5">
                                Ref: {order.id?.slice(-8).toUpperCase()}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <i className="bi bi-x-lg text-xl" />
                    </button>
                </div>

                {/* Modal Content - Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-8 bg-white">
                    <div className="flex flex-col gap-10">
                        {/* 1. Header Info (Seller & Date) */}
                        <div className="flex flex-wrap justify-between gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex flex-col">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Vendedor</label>
                                <span className="font-bold text-slate-800">{order.seller || "Não definido"}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Data de Emissão</label>
                                <span className="font-bold text-slate-800">{order.date}</span>
                            </div>
                        </div>

                        {/* 2. Observations */}
                        <div className="flex flex-col">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-4 flex items-center gap-2">
                                <i className="bi bi-info-circle-fill" /> Observações do Pedido
                            </h3>
                            <textarea
                                value={order.observation}
                                onChange={(e) => setOrder({ ...order, observation: e.target.value })}
                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-400 outline-none transition-all min-h-[100px] text-sm font-medium"
                                placeholder="Notas adicionais sobre o pedido..."
                            />
                        </div>

                        {/* 3. Customer Data */}
                        <div className="flex flex-col">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-4 flex items-center gap-2">
                                <i className="bi bi-person-fill" /> Dados do Cliente
                            </h3>
                            <div className="bg-white border-2 border-slate-100 p-6 rounded-2xl shadow-sm">
                                <CustomerDataInputs customerData={order.customerData || {} as any} setCustomerData={updateCustomerData} />
                            </div>
                        </div>

                        {/* 4. Items Table */}
                        <div className="flex flex-col">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-4 flex items-center gap-2">
                                <i className="bi bi-cart-fill" /> Itens e Produtos
                            </h3>
                            <div className="bg-white border-2 border-slate-100 p-6 rounded-2xl shadow-sm">
                                <ItemsTable items={order.items || []} setItems={updateItems} summary={order.itemsSummary} />
                            </div>
                        </div>

                        {/* 5. Shipping & Payments */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-6">
                            <div className="flex flex-col">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-4 flex items-center gap-2">
                                    <i className="bi bi-truck" /> Entrega e Frete
                                </h3>
                                <div className="bg-white border-2 border-slate-100 p-6 rounded-2xl shadow-sm h-full">
                                    <ShippingData shipping={order.shipping || {} as any} setShipping={updateShipping} />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-4 flex items-center gap-2">
                                    <i className="bi bi-credit-card-fill" /> Pagamento
                                </h3>
                                <div className="bg-white border-2 border-slate-100 p-6 rounded-2xl shadow-sm h-full">
                                    <PaymentsTable payments={order.payments || []} setPayments={updatePayments} summary={order.paymentsSummary} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 transition-all active:scale-95"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSaving ? (
                            <><i className="bi bi-arrow-repeat animate-spin" /> Salvando...</>
                        ) : (
                            <><i className="bi bi-check-lg text-lg" /> Salvar Alterações</>
                        )}
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}} />
        </div>
    );
};

export default OrderEditModal;
