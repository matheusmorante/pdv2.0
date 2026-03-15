import React from 'react';
import Product from '../../../../types/product.type';

interface ProductFiscalTabProps {
    formData: Partial<Product>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<Product>>>;
    handleGenerateNCM: () => void;
    isGeneratingNCM: boolean;
}

const ProductFiscalTab: React.FC<ProductFiscalTabProps> = ({
    formData,
    setFormData,
    handleGenerateNCM,
    isGeneratingNCM
}) => {
    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-slate-50/50 dark:bg-slate-950/20 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col gap-6">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <i className="bi bi-file-earmark-text text-blue-600"></i> Informações Fiscais para NF-e
                        </h4>
                        <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-1">Dados essenciais para emissão de nota fiscal</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleGenerateNCM}
                        disabled={isGeneratingNCM}
                        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isGeneratingNCM ? 'bg-slate-100 text-slate-400' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
                    >
                        {isGeneratingNCM ? <i className="bi bi-hourglass-split animate-spin"></i> : <i className="bi bi-search"></i>}
                        Descobrir NCM com IA
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Código NCM (8 Dígitos) *</label>
                        <input
                            value={formData.fiscal?.ncm || ''}
                            onChange={(e) => setFormData({ ...formData, fiscal: { ...formData.fiscal!, ncm: e.target.value.replace(/\D/g, '').slice(0, 8) } })}
                            className="w-full px-4 py-4 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-sm font-bold tracking-[0.2em] dark:text-slate-200"
                            placeholder="Ex: 94034000"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Código CEST (Opcional)</label>
                        <input
                            value={formData.fiscal?.cest || ''}
                            onChange={(e) => setFormData({ ...formData, fiscal: { ...formData.fiscal!, cest: e.target.value.replace(/\D/g, '') } })}
                            className="w-full px-4 py-4 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-sm font-bold tracking-[0.2em] dark:text-slate-200"
                            placeholder="Ex: 0100100"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Descrição do NCM</label>
                    <input
                        value={formData.fiscal?.ncmDescription || ''}
                        onChange={(e) => setFormData({ ...formData, fiscal: { ...formData.fiscal!, ncmDescription: e.target.value } })}
                        className="w-full px-4 py-4 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-xs font-bold dark:text-slate-200"
                        placeholder="Ex: Móveis de cozinha, de madeira..."
                    />
                </div>
            </div>

            {/* Simples Nacional / Tributação */}
            <div className="bg-slate-50/50 dark:bg-slate-950/20 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col gap-6">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Configurações de Imposto por Produto</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">CFOP Padrão (Venda Estadual)</label>
                        <input
                            value={formData.fiscal?.cfop || '5102'}
                            onChange={(e) => setFormData({ ...formData, fiscal: { ...formData.fiscal!, cfop: e.target.value } })}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-xs font-bold dark:text-slate-200"
                            placeholder="EX: 5102"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Aliquota ICMS (%)</label>
                        <input
                            type="number"
                            value={formData.fiscal?.icmsPercent}
                            onChange={(e) => setFormData({ ...formData, fiscal: { ...formData.fiscal!, icmsPercent: parseFloat(e.target.value) } })}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-xs font-bold dark:text-slate-200"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductFiscalTab;
