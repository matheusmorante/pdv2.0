import React from 'react';
import { Variation } from '../../../../types/product.type';

interface ProductVariationsTabProps {
    variations: Variation[];
    isGeneratingBulk: boolean;
    bulkVariationOptions: { name: string, values: string }[];
    setBulkVariationOptions: React.Dispatch<React.SetStateAction<{ name: string, values: string }[]>>;
    generateBulkVariations: () => void;
    addVariation: () => void;
    VariationRow: React.FC<any>;
    updateVariation: (id: string, field: keyof Variation, value: any) => void;
    removeVariation: (id: string) => void;
    setFormData: any;
    isCombo: boolean;
    onEditCombo: (id: string) => void;
    onEdit: (id: string) => void;
}

const ProductVariationsTab: React.FC<ProductVariationsTabProps> = ({
    variations,
    isGeneratingBulk,
    bulkVariationOptions,
    setBulkVariationOptions,
    generateBulkVariations,
    addVariation,
    VariationRow,
    updateVariation,
    removeVariation,
    setFormData,
    isCombo,
    onEditCombo,
    onEdit
}) => {
    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Bulk Generator */}
            <div className="bg-slate-50/50 dark:bg-slate-950/20 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col gap-6">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <i className="bi bi-grid-3x3-gap-fill text-blue-600"></i> Gerador Automático de Variações
                        </h4>
                        <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-1">Gere múltiplas variações de forma instantânea</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setBulkVariationOptions([...bulkVariationOptions, { name: '', values: '' }])}
                        className="text-[9px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
                    >
                        + Adicionar Atributo
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    {bulkVariationOptions.map((opt, idx) => (
                        <div key={idx} className="flex gap-4 items-end animate-in slide-in-from-left-2 duration-200">
                            <div className="flex-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Atributo (Ex: Cor)</label>
                                <input
                                    value={opt.name}
                                    onChange={(e) => {
                                        const next = [...bulkVariationOptions];
                                        next[idx].name = e.target.value;
                                        setBulkVariationOptions(next);
                                    }}
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-xs font-bold"
                                    placeholder="Ex: Cor, Tamanho, Material..."
                                />
                            </div>
                            <div className="flex-[2]">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Valores (Separados por vírgula)</label>
                                <input
                                    value={opt.values}
                                    onChange={(e) => {
                                        const next = [...bulkVariationOptions];
                                        next[idx].values = e.target.value;
                                        setBulkVariationOptions(next);
                                    }}
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-xs font-bold"
                                    placeholder="Ex: Azul, Vermelho, Preto..."
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => setBulkVariationOptions(bulkVariationOptions.filter((_, i) => i !== idx))}
                                className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors"
                            >
                                <i className="bi bi-trash"></i>
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={generateBulkVariations}
                        disabled={isGeneratingBulk || bulkVariationOptions.some(o => !o.name || !o.values)}
                        className="w-full py-4 mt-2 bg-slate-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                    >
                        Gerar {variations.length > 0 ? 'Novas ' : ''}Variações no Catálogo
                    </button>
                </div>
            </div>

            {/* Variations Table */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Lista de Variações ({variations.length})</h4>
                    <button
                        type="button"
                        onClick={addVariation}
                        className="bg-emerald-500 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                    >
                        + Nova Variação Manual
                    </button>
                </div>

                <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-[2.5rem] bg-white dark:bg-slate-950/20 shadow-sm">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50">
                                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">Variação / Título</th>
                                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">Preço Venda (R$)</th>
                                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">P. Custo (R$)</th>
                                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">Estoque</th>
                                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {variations.map(v => (
                                <VariationRow
                                    key={v.id}
                                    v={v}
                                    updateVariation={updateVariation}
                                    removeVariation={removeVariation}
                                    setFormData={setFormData}
                                    isCombo={isCombo}
                                    onEditCombo={onEditCombo}
                                    onEdit={onEdit}
                                />
                            ))}
                            {variations.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                                        <i className="bi bi-stack text-4xl mb-3 block opacity-20"></i>
                                        <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma variação definida ainda.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductVariationsTab;
