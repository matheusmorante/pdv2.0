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

interface Props {
    product?: Product | null;
    isOpen: boolean;
    onClose: () => void;
}

const PriceHistoryModal = ({ product, isOpen, onClose }: Props) => {
    const [history, setHistory] = useState<PriceHistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen) return;

        const fetchHistory = async () => {
            setLoading(true);
            try {
                let query = supabase
                    .from('product_price_history')
                    .select('*, products(description)')
                    .order('changed_at', { ascending: false });

                if (product?.id) {
                    query = query.eq('product_id', product.id);
                }

                const { data, error } = await query;

                if (error) throw error;

                setHistory(data.map((item: any) => ({
                    ...item,
                    product_description: item.products?.description
                })));
            } catch (err) {
                console.error("Erro ao buscar histórico de preços:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [product, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[80vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-slide-up border border-slate-100 dark:border-slate-800"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-blue-50 dark:bg-blue-900/10 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
                            <i className="bi bi-clock-history text-white text-xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                                Histórico de Preços
                            </h2>
                            <p className="text-[10px] uppercase font-black text-blue-600 dark:text-blue-400 tracking-widest mt-0.5">
                                {product ? `Produto: ${product.description}` : "Todas as alterações de preços"}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                        <i className="bi bi-x-lg text-xl" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <i className="bi bi-arrow-repeat text-4xl text-blue-500 animate-spin" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Carregando histórico...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-30">
                            <i className="bi bi-journal-x text-5xl text-slate-400" />
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Nenhum registro encontrado</p>
                            <p className="text-slate-400 text-xs text-center px-8">As alterações de preço e custo serão registradas automaticamente a partir de agora.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/80 backdrop-blur-sm z-10">
                                <tr className="border-b border-slate-100 dark:border-slate-700">
                                    {!product && <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Produto</th>}
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Data/Hora</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Preço Venda</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Preço Custo</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Tipo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {history.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        {!product && (
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{entry.product_description}</span>
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                                                {formatDateTime(entry.changed_at)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
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
                                        <td className="px-6 py-4 text-right">
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
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${entry.change_type === 'unit_price' ? 'bg-blue-100 text-blue-600' :
                                                    entry.change_type === 'cost_price' ? 'bg-emerald-100 text-emerald-600' :
                                                        'bg-indigo-100 text-indigo-600'
                                                }`}>
                                                {entry.change_type === 'unit_price' ? 'Venda' :
                                                    entry.change_type === 'cost_price' ? 'Custo' : 'Venda/Custo'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0 text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Total de {history.length} registros encontrados
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PriceHistoryModal;
