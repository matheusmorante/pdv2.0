import React, { useState, useEffect, useMemo } from "react";
import Product, { Variation } from "../../types/product.type";
import { subscribeToProducts } from "../../utils/productService";
import { formatCurrency } from "../../utils/formatters";
import ProductFormModal from "../Products/ProductFormModal";

interface Props {
    onSelect: (product: Product, variation?: Variation) => void;
    onClose: () => void;
    priceType?: 'unit' | 'cost';
}

const ProductSearchModal = ({ onSelect, onClose, priceType = 'unit' }: Props) => {
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isProductFormOpen, setIsProductFormOpen] = useState(false);

    useEffect(() => {
        const unsub = subscribeToProducts((data) => {
            setProducts(data.filter(p => p.active && !p.deleted));
            setLoading(false);
        });
        return () => { if (unsub) unsub(); };
    }, []);

    const filtered = useMemo(() => {
        if (!search.trim()) return products;
        const s = search.toLowerCase();
        return products.filter(p =>
            (p.description || '').toLowerCase().includes(s) ||
            (p.code || '').toLowerCase().includes(s) ||
            (p.category || '').toLowerCase().includes(s)
        );
    }, [products, search]);

    return (
        <div
            className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-[3px] animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-slide-up border border-slate-100 dark:border-slate-800"
                style={{ maxHeight: '90vh' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-blue-50 dark:bg-blue-900/10 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
                            <i className="bi bi-box-seam-fill text-white text-xl" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">
                                Selecionar Produto / Serviço
                            </h2>
                            <p className="text-[10px] uppercase font-black text-blue-600 dark:text-blue-400 tracking-widest mt-0.5">
                                Pesquise no catálogo de itens
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => setIsProductFormOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all shadow-md active:scale-95 font-black text-[10px] uppercase tracking-widest"
                        >
                            <i className="bi bi-plus-lg" />
                            Novo Item
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                        >
                            <i className="bi bi-x-lg text-xl" />
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                    <div className="relative">
                        <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            autoFocus
                            type="text"
                            placeholder="Busque por descrição, código ou categoria..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:font-normal placeholder:text-slate-400"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <i className="bi bi-x-circle-fill" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Product List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
                            <i className="bi bi-hourglass-split animate-spin text-2xl" />
                            <span className="text-sm font-bold">Carregando itens...</span>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                            <i className="bi bi-box-seam text-4xl opacity-30" />
                            <p className="text-sm font-bold">Nenhum item encontrado</p>
                            <p className="text-xs text-slate-400">Tente buscar por outro termo ou cadastre um novo item</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/80 backdrop-blur-sm z-10">
                                <tr className="border-b border-slate-100 dark:border-slate-700">
                                    <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Item</th>
                                    <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Código</th>
                                    <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Categoria</th>
                                    <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">{priceType === 'cost' ? 'Custo' : 'Preço'}</th>
                                    <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Estoque</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {filtered.map((p) => (
                                    <React.Fragment key={p.id}>
                                        <tr
                                            onClick={() => {
                                                if (p.hasVariations && p.variations && p.variations.length > 0) {
                                                    // Se tem variações, não seleciona o pai diretamente (ou seleciona? depende da regra)
                                                    // Vou deixar selecionar o pai se quiser, mas as variações estarão abaixo.
                                                    onSelect(p);
                                                } else {
                                                    onSelect(p);
                                                }
                                                onClose();
                                            }}
                                            className="hover:bg-blue-50/60 dark:hover:bg-blue-900/10 cursor-pointer transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                        {p.description}
                                                    </span>
                                                    <div className="flex gap-1.5 items-center mt-1">
                                                        {p.isCombo && (
                                                            <span className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border border-purple-200 dark:border-purple-900/40">
                                                                <i className="bi bi-layers-fill"></i> Combo
                                                            </span>
                                                        )}
                                                        <span className={`text-[8px] w-fit px-1.5 py-0.5 rounded-md font-black uppercase tracking-widest ${p.itemType === 'service' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20'}`}>
                                                            {p.itemType === 'service' ? 'Serviço' : 'Produto'}
                                                        </span>
                                                        {p.itemType === 'product' && p.condition && (
                                                            <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-widest border ${p.condition === 'novo' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400' :
                                                                p.condition === 'usado' ? 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400' :
                                                                    'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400'
                                                                }`}>
                                                                {p.condition}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-xs font-mono text-slate-400">
                                                    {p.code || "---"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    {p.category || "Sem Categoria"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right primary-td">
                                                <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                                                    {!p.hasVariations && formatCurrency((priceType === 'cost' ? p.costPrice : p.unitPrice) || 0)}
                                                    {p.hasVariations && "---"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`text-xs font-bold ${p.stock && p.stock <= (p.minStock || 0) ? 'text-red-500' : 'text-slate-500'}`}>
                                                    {p.itemType === 'service' ? '∞' : (
                                                        p.isCombo
                                                            ? (p.comboItems?.length
                                                                ? Math.min(...p.comboItems.map(i => Math.floor((i.stock || 0) / (i.quantity || 1))))
                                                                : 0)
                                                            : (p.stock || 0)
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                {!p.hasVariations && (
                                                    <button
                                                        type="button"
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-700"
                                                    >
                                                        Selecionar
                                                        <i className="bi bi-plus" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                        {p.hasVariations && p.variations?.map(v => (
                                            <tr
                                                key={v.id}
                                                onClick={() => { onSelect(p, v); onClose(); }}
                                                className="bg-slate-50/30 dark:bg-slate-800/20 hover:bg-blue-50/40 dark:hover:bg-blue-900/20 cursor-pointer transition-colors group"
                                            >
                                                <td className="px-6 py-3 pl-12 border-l-2 border-blue-200 dark:border-blue-900">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                                                            {v.name}
                                                        </span>
                                                        <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Variação</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-[10px] font-mono text-slate-400">
                                                        {v.sku || "---"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-[9px] text-slate-300 italic">Mesma Categoria</span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className={`text-xs font-black ${priceType === 'cost' ? 'text-orange-600/80' : 'text-blue-600/80'}`}>
                                                        {formatCurrency((priceType === 'cost' ? v.costPrice : v.unitPrice) || 0)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`text-[10px] font-bold ${v.stock <= (v.minStock || 0) ? 'text-red-400' : 'text-slate-400'}`}>
                                                        {v.stock}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        type="button"
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white"
                                                    >
                                                        Selecionar
                                                        <i className="bi bi-plus" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                    <p className="text-[10px] text-slate-400 font-bold">
                        Dica: Use as setas do teclado para navegar (em breve)
                    </p>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-500 transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>

            {isProductFormOpen && (
                <ProductFormModal
                    isOpen={isProductFormOpen}
                    onClose={() => setIsProductFormOpen(false)}
                    onSuccess={(newProduct: Product) => {
                        onSelect(newProduct);
                        onClose();
                    }}
                />
            )}
        </div>
    );
};

export default ProductSearchModal;
