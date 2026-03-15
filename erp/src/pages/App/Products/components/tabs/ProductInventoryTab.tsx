import React from 'react';
import Product from '../../../../types/product.type';
import SmartInput from '../../../../../components/SmartInput';
import { toast } from 'react-toastify';

interface ProductInventoryTabProps {
    formData: Partial<Product>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<Product>>>;
    suppliers: any[];
}

const ProductInventoryTab: React.FC<ProductInventoryTabProps> = ({
    formData,
    setFormData,
    suppliers
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

                <div className="p-6 bg-blue-600 rounded-[2rem] flex items-center justify-between shadow-xl shadow-blue-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-2xl">
                            <i className="bi bi-wallet2 text-2xl text-white"></i>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-100 opacity-70">Preço Final de Compra Estimado</p>
                            <p className="text-2xl font-black text-white">R$ {formData.finalPurchasePrice?.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Inventory Management */}
                <div className="bg-slate-50/50 dark:bg-slate-950/20 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col gap-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <i className="bi bi-box-seam text-blue-600"></i> Gestão de Estoque
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Estoque Atual</label>
                            <input
                                type="number"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-sm font-bold dark:text-slate-200"
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
