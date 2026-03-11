import React, { useState, useEffect, useMemo } from "react";
import { formatToBRDate, formatCurrency } from "../../utils/formatters";
import { PatternFormat } from "react-number-format";
import { saveOrder, subscribeToOrders } from "../../utils/orderHistoryService";
import { toast } from "react-toastify";
import Order, { AssistanceItem } from "../../types/order.type";
import Item from "../../types/items.type";
import CustomerData from "../../types/customerData.type";
import Product, { Variation } from "../../types/product.type";
import ProductSearchModal from "./ProductSearchModal";
import OrderSelectionModal from "./OrderSelectionModal";
import TagInput from "../../../components/TagInput";
import SmartInput from "../../../components/SmartInput";
import CustomerSearchModal from "./CustomerSearchModal";

interface AssistanceOrderModalProps {
    onClose: () => void;
    onSaveSuccess: () => void;
    order?: Order | null;
}

const EMPTY_CUSTOMER: CustomerData = {
    fullName: "",
    phone: "",
    noPhone: false,
    fullAddress: {
        cep: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        observation: "",
    },
};

const DEFAULT_SHIPPING: any = {
    value: 0,
    deliveryMethod: 'pickup',
    orderType: 'Standard',
    scheduling: {
        date: "",
        time: "",
        type: 'fixed'
    }
};

const AssistanceOrderModal = ({ onClose, onSaveSuccess, order }: AssistanceOrderModalProps) => {
    const [customerName, setCustomerName] = useState(order?.customerData?.fullName || "");
    const [customerPhone, setCustomerPhone] = useState(order?.customerData?.phone || "");
    const [description, setDescription] = useState(order?.assistanceDescription || "");
    const [observation, setObservation] = useState(order?.observation || "");
    const [scheduledDate, setScheduledDate] = useState(order?.scheduledDate || "");
    const [scheduledTime, setScheduledTime] = useState(order?.scheduledTime || "");
    const [isLinked, setIsLinked] = useState(!!order?.linkedOrderId);
    const [linkedOrderId, setLinkedOrderId] = useState(order?.linkedOrderId || "");
    const [selectedAssistanceItems, setSelectedAssistanceItems] = useState<AssistanceItem[]>(order?.assistanceItems || []);
    const [extraItems, setExtraItems] = useState<Item[]>(order?.items || []);
    const [saleOrders, setSaleOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
    const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);
    const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);

    const isEditing = !!order;

    // Fetch all sale orders to allow linking
    useEffect(() => {
        const unsubscribe = subscribeToOrders((data) => {
            setSaleOrders(data.filter(o => o.orderType !== 'assistance' && !o.deleted));
            setLoadingOrders(false);
        });
        return () => unsubscribe();
    }, []);

    const currentLinkedOrder = useMemo(() =>
        saleOrders.find(o => o.id === linkedOrderId),
        [saleOrders, linkedOrderId]
    );

    const handleToggleItem = (itemDescription: string, maxQty: number) => {
        const exists = selectedAssistanceItems.find(i => i.description === itemDescription);
        if (exists) {
            setSelectedAssistanceItems(prev => prev.filter(i => i.description !== itemDescription));
        } else {
            setSelectedAssistanceItems(prev => [...prev, {
                id: Math.random().toString(36).substr(2, 9),
                description: itemDescription,
                quantity: 1,
                originalOrderId: linkedOrderId
            }]);
        }
    };

    const handleUpdateItemQty = (description: string, qty: number, maxQty: number) => {
        if (qty < 1) return;
        if (qty > maxQty) {
            toast.warning(`Quantidade máxima disponível: ${maxQty}`);
            return;
        }
        setSelectedAssistanceItems(prev => prev.map(i =>
            i.description === description ? { ...i, quantity: qty } : i
        ));
    };

    const handleSelectOrder = (selectedOrder: Order) => {
        setLinkedOrderId(selectedOrder.id || "");
        setSelectedAssistanceItems([]);
        setCustomerName(selectedOrder.customerData.fullName);
        setCustomerPhone(selectedOrder.customerData.phone || "");
        setIsSelectionModalOpen(false);
        toast.info(`Pedido #${selectedOrder.id} selecionado.`);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerName.trim()) {
            toast.warning("Informe o nome do cliente.");
            return;
        }
        if (!description.trim()) {
            toast.warning("Descreva o serviço de assistência.");
            return;
        }

        setLoading(true);
        try {
            const assistanceOrder: Order = {
                ...(order || {}),
                orderType: 'assistance',
                status: order?.status || 'draft',
                customerData: {
                    ...(order?.customerData || EMPTY_CUSTOMER),
                    fullName: customerName.trim(),
                    phone: customerPhone.trim(),
                },
                assistanceDescription: description.trim(),
                scheduledDate,
                scheduledTime,
                observation,
                ...(isLinked ? {
                    linkedOrderId,
                    assistanceItems: selectedAssistanceItems
                } : {}),
                date: order?.date || new Date().toISOString(),
                items: extraItems,
                itemsSummary: {
                    totalQuantity: extraItems.reduce((acc, i) => acc + i.quantity, 0),
                    itemsSubtotal: extraItems.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0),
                    totalFixedDiscount: 0,
                    itemsTotalValue: extraItems.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0),
                },
                payments: order?.payments || [],
                paymentsSummary: order?.paymentsSummary || {
                    totalPaymentsFee: 0,
                    totalOrderValue: extraItems.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0),
                    totalAmountPaid: 0,
                    amountRemaining: extraItems.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0)
                },
                shipping: order?.shipping || DEFAULT_SHIPPING,
                seller: order?.seller || "",
            };

            await saveOrder(assistanceOrder);
            toast.success(isEditing ? "Assistência atualizada com sucesso!" : "Pedido de assistência criado com sucesso!");
            onSaveSuccess();
            onClose();
        } catch (error: any) {
            console.error("Erro ao salvar assistência:", error);
            toast.error(`${isEditing ? "Erro ao atualizar" : "Erro ao criar"} assistência: ${error?.message || "Erro desconhecido"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[2px] animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-slide-up border border-slate-100 dark:border-slate-800"
                onClick={(e) => e.stopPropagation()}
                style={{ maxHeight: '90vh' }}
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-amber-50 dark:bg-amber-900/10 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="bg-amber-500 p-2.5 rounded-2xl shadow-lg shadow-amber-200 dark:shadow-amber-900/30">
                            <i className="bi bi-tools text-white text-xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                                {isEditing ? "Editar Assistência" : "Novo Pedido de Assistência"}
                            </h2>
                            <p className="text-[10px] uppercase font-black text-amber-600 dark:text-amber-400 tracking-widest mt-0.5">
                                Atendimento / Serviço Técnico
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-full transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                        <i className="bi bi-x-lg text-xl" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSave} className="p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                    {/* Customer */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
                            <i className="bi bi-person-fill text-amber-500" />
                            Dados do Cliente
                        </h3>

                        <div className="flex flex-col gap-2 relative">
                            <SmartInput
                                label="Nome do Cliente"
                                required
                                value={customerName}
                                onValueChange={(val: string) => setCustomerName(val)}
                                tableName="people"
                                columnName="fullName"
                                placeholder="Ex: João da Silva"
                                icon="bi-person"
                            />
                            <button
                                type="button"
                                onClick={() => setIsCustomerSearchOpen(true)}
                                className="absolute right-3 top-[34px] p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                title="Busca Avançada"
                            >
                                <i className="bi bi-search text-xs"></i>
                            </button>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                Telefone / WhatsApp
                            </label>
                            <div className="flex gap-2">
                                <PatternFormat
                                    format="(##) #####-####"
                                    type="tel"
                                    value={customerPhone}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerPhone(e.target.value)}
                                    placeholder="(00) 00000-0000"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
                                />
                                <button type="button"
                                    onClick={() => {
                                        if (!customerPhone) return;
                                        const cleanPhone = customerPhone.replace(/\D/g, '');
                                        const finalPhone = cleanPhone.length >= 10 && cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
                                        window.open(`https://wa.me/${finalPhone}`, '_blank');
                                    }}
                                    title="Verificar WhatsApp"
                                    className="shrink-0 w-12 flex items-center justify-center bg-[#25D366] hover:bg-[#128C7E] text-white rounded-2xl transition-all shadow-sm shadow-[#25D366]/30 active:scale-95"
                                >
                                    <i className="bi bi-whatsapp text-lg"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Linking to Sale Order */}
                    <div className="flex flex-col gap-4 p-5 rounded-[2.5rem] bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 transition-all">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500 rounded-xl shadow-md shadow-indigo-200 dark:shadow-indigo-900/30">
                                    <i className="bi bi-link-45deg text-white text-lg" />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                                        Vínculo com Venda
                                    </h3>
                                    <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-tighter">Associar esta assistência a um pedido</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsLinked(!isLinked)}
                                className={`w-12 h-6 rounded-full transition-all relative ${isLinked ? 'bg-indigo-600 shadow-inner' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${isLinked ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        {isLinked && (
                            <div className="flex flex-col gap-4 animate-slide-up">
                                {!linkedOrderId ? (
                                    <button
                                        type="button"
                                        onClick={() => setIsSelectionModalOpen(true)}
                                        className="w-full py-4 px-6 border-2 border-dashed border-indigo-200 dark:border-indigo-800/50 rounded-2xl bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase tracking-widest hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        <i className="bi bi-plus-circle-fill text-lg group-hover:scale-110 transition-transform" />
                                        Selecionar Pedido Original
                                    </button>
                                ) : (
                                    <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 shadow-sm relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-2">
                                            <button
                                                type="button"
                                                onClick={() => setIsSelectionModalOpen(true)}
                                                className="p-1.5 text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                                                title="Trocar pedido"
                                            >
                                                <i className="bi bi-arrow-left-right" />
                                            </button>
                                        </div>
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Pedido Selecionado</p>
                                        <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">
                                            #{currentLinkedOrder?.id} — {currentLinkedOrder?.customerData.fullName}
                                        </h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                            Data da Venda: {formatToBRDate(currentLinkedOrder?.date)}
                                        </p>
                                    </div>
                                )}

                                {currentLinkedOrder && (
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                                Itens sob Assistência
                                            </label>
                                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">
                                                {selectedAssistanceItems.length} selecionado(s)
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                            {currentLinkedOrder.items.map((item, idx) => {
                                                const isSelected = selectedAssistanceItems.some(i => i.description === item.description);
                                                const selectedItem = selectedAssistanceItems.find(i => i.description === item.description);

                                                return (
                                                    <div
                                                        key={`${item.description}-${idx}`}
                                                        className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 ${isSelected ? 'border-indigo-400 bg-white dark:bg-slate-900 shadow-md' : 'border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/40 cursor-pointer'}`}
                                                        onClick={() => handleToggleItem(item.description, item.quantity)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-5 h-5 rounded-lg flex items-center justify-center border-2 transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                                                                {isSelected && <i className="bi bi-check-lg text-white text-[10px] font-black" />}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-black text-slate-700 dark:text-slate-200">{item.description}</p>
                                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Saldo: {item.quantity}</p>
                                                            </div>
                                                        </div>

                                                        {isSelected && (
                                                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-indigo-100 dark:border-indigo-900/30" onClick={e => e.stopPropagation()}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleUpdateItemQty(item.description, (selectedItem?.quantity || 1) - 1, item.quantity)}
                                                                    className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center text-slate-500 hover:text-indigo-600 shadow-sm transition-all"
                                                                >
                                                                    <i className="bi bi-dash-lg" />
                                                                </button>
                                                                <span className="text-xs font-black text-indigo-600 min-w-[24px] text-center">{selectedItem?.quantity}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleUpdateItemQty(item.description, (selectedItem?.quantity || 1) + 1, item.quantity)}
                                                                    className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center text-slate-500 hover:text-indigo-600 shadow-sm transition-all"
                                                                >
                                                                    <i className="bi bi-plus-lg" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
                            <i className="bi bi-clipboard-fill text-amber-500" />
                            Detalhes da Assistência
                        </h3>
                        <div className="flex flex-col gap-2">
                            <SmartInput
                                label="Descrição do Serviço"
                                required
                                value={description}
                                onValueChange={(val: string) => setDescription(val)}
                                tableName="orders"
                                columnName="assistanceDescription"
                                placeholder="Descreva o problema ou solicitação..."
                                icon="bi-wrench"
                            />
                        </div>
                        <div className="flex flex-col gap-2 mt-4 px-1">
                            <TagInput
                                label="Observações Técnicas"
                                value={observation}
                                onChange={setObservation}
                                placeholder="Notas internas, peças extras, observações, etc..."
                            />
                        </div>
                    </div>

                    {/* Pieces and Materials */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
                                <i className="bi bi-box-seam-fill text-indigo-500" />
                                Peças e Materiais Utilizados
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsProductSearchOpen(true)}
                                className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 dark:border-indigo-900/50"
                            >
                                <i className="bi bi-plus-lg mr-1.5" />
                                Adicionar Item
                            </button>
                        </div>

                        <div className="flex flex-col gap-2">
                            {extraItems.length === 0 ? (
                                <div className="p-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] flex flex-col items-center justify-center text-center">
                                    <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-300 mb-3">
                                        <i className="bi bi-cart-plus text-lg" />
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nenhuma peça adicionada</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {extraItems.map((item, idx) => (
                                        <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-xs font-black text-slate-700 dark:text-slate-200">
                                                    {item.description}
                                                </span>
                                                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                                    {item.quantity} {item.quantity === 1 ? 'unidade' : 'unidades'} • {formatCurrency(item.unitPrice)}/un
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-black text-indigo-600">
                                                    {formatCurrency(item.quantity * item.unitPrice)}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setExtraItems(prev => prev.filter((_, i) => i !== idx))}
                                                    className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                                                >
                                                    <i className="bi bi-trash3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex justify-end px-4 py-2 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 dark:text-indigo-500 mr-2">Subtotal Peças:</span>
                                        <span className="text-xs font-black text-indigo-600">
                                            {formatCurrency(extraItems.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0))}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
                            <i className="bi bi-calendar-event-fill text-amber-500" />
                            Agendamento da Assistência
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Data</label>
                                <input
                                    type="date"
                                    value={scheduledDate}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Horário</label>
                                <input
                                    type="time"
                                    value={scheduledTime}
                                    onChange={(e) => setScheduledTime(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-red-200 dark:hover:border-red-900"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-amber-200 dark:shadow-amber-900/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <i className="bi bi-hourglass-split animate-spin" />
                            ) : (
                                <i className="bi bi-check-lg" />
                            )}
                            {loading ? "Salvando..." : isEditing ? "Salvar Alterações" : "Criar Pedido"}
                        </button>
                    </div>
                </form>
            </div>

            {isSelectionModalOpen && (
                <OrderSelectionModal
                    orders={saleOrders}
                    onClose={() => setIsSelectionModalOpen(false)}
                    onSelect={handleSelectOrder}
                />
            )}

            {isProductSearchOpen && (
                <ProductSearchModal
                    onClose={() => setIsProductSearchOpen(false)}
                    onSelect={(p, v) => {
                        const description = v ? `${p.description} (${v.name})` : p.description;
                        const newItem: Item = {
                            productId: p.id!,
                            variationId: v?.id,
                            description,
                            quantity: 1,
                            unitPrice: (v ? v.unitPrice : p.unitPrice) || 0,
                            unitDiscount: 0,
                            discountType: 'fixed',
                            handlingType: 'Standard'
                        };
                        setExtraItems(prev => [...prev, newItem]);
                    }}
                />
            )}

            {isCustomerSearchOpen && (
                <CustomerSearchModal
                    onClose={() => setIsCustomerSearchOpen(false)}
                    onSelect={(c) => {
                        setCustomerName(c.fullName);
                        setCustomerPhone(c.phone || "");
                    }}
                />
            )}
        </div>
    );
};

export default AssistanceOrderModal;
