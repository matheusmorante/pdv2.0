import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseConfig";
import { formatCurrency, formatDateTime } from "../../utils/formatters";
import Product from "../../types/product.type";

interface PriceHistoryEntry {
    id: string;
    product_id: string;
    old_unit_price: number;
    new_unit_price: number;
    old_cost_price: number;
    new_cost_price: number;
    change_type: string;
    changed_at: string;
    changed_by: string;
    product_description?: string;
}

interface InventoryMoveEntry {
    id: string;
    product_id: string;
    type: string;
    quantity: number;
    unit_cost: number;
    date: string;
    label: string;
    observation: string;
}

interface Props {
    product?: Product | null;
    isOpen: boolean;
    onClose: () => void;
}

const PriceHistoryModal = ({ product, isOpen, onClose }: Props) => {
    const [activeTab, setActiveTab] = useState<'prices' | 'batches'>('prices');
    const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>([]);
    const [batchHistory, setBatchHistory] = useState<InventoryMoveEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                if (activeTab === 'prices') {
                    let query = supabase
                        .from('product_price_history')
                        .select('*, products(description)')
                        .order('changed_at', { ascending: false });

                    if (product?.id) {
                        query = query.eq('product_id', product.id);
                    }

                    const { data, error } = await query;
                    if (error) throw error;

                    setPriceHistory(data.map((item: any) => ({
                        ...item,
                        product_description: item.products?.description
                    })));
                } else {
                    let query = supabase
                        .from('inventory_moves')
                        .select('*')
                        .eq('type', 'entry')
                        .order('date', { ascending: false });

                    if (product?.id) {
                        query = query.eq('product_id', product.id);
                    }

                    const { data, error } = await query;
                    if (error) throw error;
                    setBatchHistory(data || []);
                }
            } catch (err) {
                console.error("Erro ao buscar históricos:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [product, isOpen, activeTab]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[85vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-slide-up border border-slate-100 dark:border-slate-800"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-8 pt-8 pb-4 border-b border-slate-100 dark:border-slate-800 bg-blue-50/50 dark:bg-blue-900/5 transition-all">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none">
                                <i className="bi bi-clock-history text-white text-xl" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                                    Históricos
                                </h2>
                                <p className="text-[10px] uppercase font-black text-blue-600 dark:text-blue-400 tracking-widest mt-0.5">
                                    {product ? `Produto: ${product.description}` : "Auditoria Geral"}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 rounded-xl transition-all border border-slate-100 dark:border-slate-700">
                            <i className="bi bi-x-lg text-lg" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
                        <button
                            onClick={() => setActiveTab('prices')}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                activeTab === 'prices' 
                                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                            }`}
                        >
                            <i className="bi bi-tags-fill mr-2" />
                            Preços de Venda
                        </button>
                        <button
                            onClick={() => setActiveTab('batches')}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                activeTab === 'batches' 
                                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                            }`}
                        >
                            <i className="bi bi-box-fill mr-2" />
                            Entradas (Lotes/Custo)
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Carregando histórico...</p>
                        </div>
                    ) : (activeTab === 'prices' ? priceHistory : batchHistory).length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4 opacity-30">
                            <i className={`bi ${activeTab === 'prices' ? 'bi-journal-x' : 'bi-box-seam'} text-5xl text-slate-400`} />
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Nenhum registro encontrado</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="sticky top-0 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-md z-10 border-b border-slate-100 dark:border-slate-700">
                                <tr>
                                    <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Data e Hora</th>
                                    {activeTab === 'prices' ? (
                                        <>
                                            {!product && <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Produto</th>}
                                            <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Novo Preço</th>
                                            <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Novo Custo</th>
                                            <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Alteração</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Quantidade</th>
                                            <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Custo do Lote</th>
                                            <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Etiqueta/Obs</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {activeTab === 'prices' 
                                    ? priceHistory.map((entry) => (
                                        <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <span className="text-xs text-slate-600 dark:text-slate-400 font-bold">
                                                    {formatDateTime(entry.changed_at)}
                                                </span>
                                            </td>
                                            {!product && (
                                                <td className="px-8 py-5">
                                                    <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">{entry.product_description}</span>
                                                </td>
                                            )}
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                                                        {formatCurrency(entry.new_unit_price)}
                                                    </span>
                                                    {entry.old_unit_price !== entry.new_unit_price && (
                                                        <span className="text-[9px] text-slate-400 line-through">
                                                            {formatCurrency(entry.old_unit_price)}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                                                        {formatCurrency(entry.new_cost_price)}
                                                    </span>
                                                    {entry.old_cost_price !== entry.new_cost_price && (
                                                        <span className="text-[9px] text-slate-400 line-through">
                                                            {formatCurrency(entry.old_cost_price)}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                                                    entry.change_type === 'unit_price' ? 'bg-blue-100 text-blue-600' :
                                                    entry.change_type === 'cost_price' ? 'bg-emerald-100 text-emerald-600' :
                                                    'bg-indigo-100 text-indigo-600'
                                                }`}>
                                                    {entry.change_type === 'unit_price' ? 'Venda' : entry.change_type === 'cost_price' ? 'Custo' : 'Ambos'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                    : batchHistory.map((entry) => (
                                        <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <span className="text-xs text-slate-600 dark:text-slate-400 font-bold">
                                                    {formatDateTime(entry.date)}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                                                    {entry.quantity}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right text-emerald-600 dark:text-emerald-400 font-black text-sm">
                                                {formatCurrency(entry.unit_cost || 0)}
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{entry.label}</span>
                                                    {entry.observation && <p className="text-[10px] text-slate-400 italic">{entry.observation}</p>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0 flex justify-between items-center">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                        Total: {(activeTab === 'prices' ? priceHistory : batchHistory).length} registros
                    </p>
                    <p className="text-[10px] text-slate-300 dark:text-slate-600 font-bold uppercase tracking-tight">
                        Rastreabilidade Morante Hub v2.0
                    </p>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0, 0, 0.2, 1) forwards; }
            `}} />
        </div>
    );
};

export default PriceHistoryModal;
