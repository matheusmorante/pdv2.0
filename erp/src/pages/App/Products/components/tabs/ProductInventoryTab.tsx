import React from 'react';
import Product from '../../../../types/product.type';
import SmartInput from '../../../../../components/SmartInput';
import { toast } from 'react-toastify';

interface ProductInventoryTabProps {
    formData: Partial<Product>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<Product>>>;
    suppliers: any[];
    handleSuggestPrices: () => void;
    isSuggestingPrices: boolean;
    suggestPricesResults: { low: any, medium: any, high: any } | null;
}

const ProductInventoryTab: React.FC<ProductInventoryTabProps> = ({
    formData,
    setFormData,
    suppliers,
    handleSuggestPrices,
    isSuggestingPrices,
    suggestPricesResults
}) => {
    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Cost Composition */}
            <div className="bg-slate-50/50 dark:bg-slate-950/20 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col gap-6">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Composição de Custo / Compra</h4>
                        <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-1">Defina como o custo final do produto é formado</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Preço de Custo (Base)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.costPrice}
                            onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) })}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-sm font-bold dark:text-slate-200"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">IPI (%)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={formData.ipiPercent}
                            onChange={(e) => setFormData({ ...formData, ipiPercent: parseFloat(e.target.value) })}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-sm font-bold dark:text-slate-200"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Valor Frete Unit.</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.freightCost}
                            onChange={(e) => setFormData({ ...formData, freightCost: parseFloat(e.target.value) })}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-sm font-bold dark:text-slate-200"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Frete por:</label>
                        <select
                            value={formData.freightType}
                            onChange={(e) => setFormData({ ...formData, freightType: e.target.value as any })}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-sm font-bold dark:text-slate-200"
                        >
                            <option value="none">Nenhum</option>
                            <option value="fixed">Valor Fixo</option>
                            <option value="percentage">Percentual (%)</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 bg-blue-600 rounded-[2rem] flex items-center justify-between shadow-xl shadow-blue-500/20">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/10 rounded-2xl">
                                <i className="bi bi-wallet2 text-2xl text-white"></i>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-100 opacity-70">Preço Final de Custo</p>
                                <p className="text-2xl font-black text-white">R$ {formData.finalPurchasePrice?.toFixed(2)}</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleSuggestPrices}
                            disabled={isSuggestingPrices}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${isSuggestingPrices ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
                        >
                            {isSuggestingPrices ? (
                                <><i className="bi bi-hourglass-split animate-spin"></i> Analisando...</>
                            ) : (
                                <><i className="bi bi-magic"></i> IA: Sugerir Preço</>
                            )}
                        </button>
                    </div>

                    <div className="p-6 bg-slate-900 dark:bg-slate-800 rounded-[2rem] flex items-center justify-between shadow-xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/20 rounded-2xl">
                                <i className="bi bi-graph-up-arrow text-2xl text-emerald-500"></i>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Margem (Markup)</p>
                                <p className="text-2xl font-black text-white">
                                    {formData.unitPrice && formData.finalPurchasePrice && formData.finalPurchasePrice > 0
                                        ? `${Math.round(((formData.unitPrice / formData.finalPurchasePrice) - 1) * 100)}%`
                                        : '0%'
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Lucro Bruto Est.</p>
                            <p className="text-sm font-black text-emerald-500">
                                R$ {((formData.unitPrice || 0) - (formData.finalPurchasePrice || 0)).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>

                {suggestPricesResults && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        {(['low', 'medium', 'high'] as const).map(tier => (
                            <button
                                key={tier}
                                type="button"
                                onClick={() => {
                                    setFormData({ ...formData, unitPrice: suggestPricesResults[tier].price });
                                    toast.success(`Preço ${suggestPricesResults[tier].label} aplicado!`);
                                }}
                                className={`flex flex-col gap-2 p-5 rounded-3xl border-2 text-left transition-all group ${tier === 'medium' ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-900/30' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-blue-100'}`}
                            >
                                <span className={`text-[9px] font-black uppercase tracking-widest ${tier === 'medium' ? 'text-blue-600' : 'text-slate-400'}`}>
                                    {suggestPricesResults[tier].label}
                                </span>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-xs font-bold text-slate-400">R$</span>
                                        <span className="text-xl font-black text-slate-800 dark:text-slate-100">
                                            {suggestPricesResults[tier].price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    {suggestPricesResults[tier].margin && (
                                        <span className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-[9px] font-black">
                                            +{suggestPricesResults[tier].margin}%
                                        </span>
                                    )}
                                </div>
                                <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span>Aplicar este valor</span>
                                    <i className="bi bi-arrow-right"></i>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Inventory Management */}
                <div className="bg-slate-50/50 dark:bg-slate-950/20 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col gap-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <i className="bi bi-box-seam text-blue-600"></i> Gestão de Estoque
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Estoque Showroom</label>
                            <input
                                type="number"
                                value={formData.showroomStock || 0}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    setFormData({ 
                                        ...formData, 
                                        showroomStock: val,
                                        stock: val + (formData.warehouseStock || 0)
                                    });
                                }}
                                className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-sm font-bold dark:text-slate-200"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Estoque Depósito</label>
                            <input
                                type="number"
                                value={formData.warehouseStock || 0}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    setFormData({ 
                                        ...formData, 
                                        warehouseStock: val,
                                        stock: (formData.showroomStock || 0) + val
                                    });
                                }}
                                className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-sm font-bold dark:text-slate-200"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-600 transition-colors">Estoque Total</label>
                            <input
                                type="number"
                                value={formData.stock}
                                readOnly
                                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-sm font-black text-blue-600 dark:text-blue-400 cursor-not-allowed"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Estoque Mínimo</label>
                            <input
                                type="number"
                                value={formData.minStock}
                                onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-sm font-bold dark:text-slate-200"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-22xl">
                        <i className="bi bi-info-circle text-amber-500"></i>
                        <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 leading-tight">
                            O sistema enviará notificações quando o estoque atingir o nível mínimo.
                        </p>
                    </div>
                </div>

                {/* Main Supplier */}
                <div className="bg-slate-50/50 dark:bg-slate-950/20 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col gap-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <i className="bi bi-truck text-blue-600"></i> Fornecedor Principal
                    </h4>
                    <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Selecione o Fornecedor</label>
                        <select
                            value={formData.mainSupplierId || ''}
                            onChange={(e) => setFormData({ ...formData, mainSupplierId: e.target.value })}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-sm font-bold dark:text-slate-200"
                        >
                            <option value="">Nenhum selecionado</option>
                            {suppliers.map(s => (
                                <option key={s.id} value={s.id}>{s.name || s.social_name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Ref. Fornecedor</label>
                        <input
                            value={formData.supplierRef || ''}
                            onChange={(e) => setFormData({ ...formData, supplierRef: e.target.value })}
                            placeholder="Ex: REF-ABC-123"
                            className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-sm font-bold dark:text-slate-200"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductInventoryTab;
