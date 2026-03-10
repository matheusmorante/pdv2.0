import React, { useState, useEffect } from "react";
import Product, { Variation } from "../../../types/product.type";
import { subscribeToProducts } from "../../../utils/productService";
import { saveInventoryMove } from "../../../utils/inventoryService";
import { toast } from "react-toastify";
import InventoryMove from "../../../types/inventoryMove.type";

interface StockLaunchModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetProduct: Product | null;
    targetVariation?: Variation;
}

type LaunchType = 'entry' | 'exit' | 'adjustment';

const StockLaunchModal = ({ isOpen, onClose, targetProduct, targetVariation }: StockLaunchModalProps) => {
    const [type, setType] = useState<LaunchType>('entry');
    const [quantity, setQuantity] = useState<number>(0);
    const [reason, setReason] = useState("");
    const [selectedProductId, setSelectedProductId] = useState<string>("");
    const [products, setProducts] = useState<Product[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const unsubscribe = subscribeToProducts((data) => {
                setProducts(data.filter(p => p.itemType === 'product' && !p.deleted));
            });
            return () => unsubscribe();
        }
    }, [isOpen]);

    useEffect(() => {
        if (targetProduct) {
            setSelectedProductId(targetProduct.id!);
        }
    }, [targetProduct]);

    const activeProduct = products.find(p => p.id === selectedProductId) || targetProduct;

    const handleSave = async () => {
        if (!selectedProductId || quantity < 0) {
            toast.error("Por favor, preencha todos os campos corretamente.");
            return;
        }

        if (!activeProduct) return;

        setIsSaving(true);
        try {
            const move: InventoryMove = {
                productId: selectedProductId,
                variationId: targetVariation?.id,
                productDescription: targetVariation
                    ? `${activeProduct.description} (${targetVariation.name})`
                    : activeProduct.description,
                type: type === 'adjustment' ? 'balance' : (type === 'entry' ? 'entry' : 'withdrawal'),
                quantity: quantity,
                date: new Date().toISOString(),
                label: 'Ajuste Manual',
                observation: reason
            };

            const currentStock = targetVariation ? (targetVariation.stock || 0) : Number(activeProduct.stock || 0);
            await saveInventoryMove(move, currentStock);
            
            toast.success("Lançamento de estoque realizado com sucesso! ✨");
            onClose();
            // Reset fields
            setQuantity(0);
            setReason("");
        } catch (error) {
            toast.error("Erro ao processar lançamento de estoque.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
            
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up border border-slate-100 dark:border-slate-800">
                <div className="p-8 bg-emerald-600 text-white flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight uppercase">Novo Lançamento</h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200 mt-1">Movimentação manual de estoque</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <i className="bi bi-x-lg text-xl"></i>
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    {/* Product Selection */}
                    {!targetProduct && (
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selecionar Produto</label>
                            <select 
                                value={selectedProductId}
                                onChange={(e) => setSelectedProductId(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-950 px-5 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-slate-700 dark:text-slate-200"
                            >
                                <option value="">Selecione um produto...</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.description} (Saldo: {p.stock})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {targetProduct && (
                        <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {targetVariation ? 'Variação Selecionada' : 'Produto Selecionado'}
                            </span>
                            <div className="mt-2 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                                    <i className={`bi ${targetVariation ? 'bi-stack' : 'bi-box-seam'} text-2xl`}></i>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-slate-100">
                                        {targetProduct.description}
                                        {targetVariation && <span className="text-emerald-600 ml-2">({targetVariation.name})</span>}
                                    </h4>
                                    <p className="text-xs text-slate-500 font-medium tracking-tight">
                                        Saldo Atual: <span className="font-black text-slate-700 dark:text-slate-200">
                                            {targetVariation ? targetVariation.stock : targetProduct.stock} {targetProduct.unit}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Launch Types */}
                    <div className="grid grid-cols-3 gap-3">
                        {(['entry', 'exit', 'adjustment'] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setType(t)}
                                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                                    type === t 
                                        ? 'bg-emerald-50 border-emerald-500 text-emerald-600 dark:bg-emerald-900/20 shadow-lg shadow-emerald-100 dark:shadow-none' 
                                        : 'bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800 text-slate-400 hober:border-slate-200'
                                }`}
                            >
                                <i className={`bi ${t === 'entry' ? 'bi-plus-circle' : t === 'exit' ? 'bi-dash-circle' : 'bi-arrow-left-right'} text-xl`}></i>
                                <span className="text-[9px] font-black uppercase tracking-widest">
                                    {t === 'entry' ? 'Entrada' : t === 'exit' ? 'Saída' : 'Balanço'}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {type === 'adjustment' ? 'Novo Saldo Total' : 'Quantidade'}
                            </label>
                            <input 
                                type="number" 
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                className="w-full bg-slate-50 dark:bg-slate-950 px-5 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-black text-xl text-slate-800 dark:text-slate-100"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Motivo / Observação</label>
                            <input 
                                type="text" 
                                placeholder="Opcional..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-950 px-5 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-sm"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleSave}
                        disabled={isSaving || !selectedProductId}
                        className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-emerald-200 dark:shadow-none transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {isSaving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <i className="bi bi-check-lg text-xl"></i>
                        )}
                        Confirmar Lançamento
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StockLaunchModal;
