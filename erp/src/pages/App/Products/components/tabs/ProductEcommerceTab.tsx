import React from 'react';
import Product from '../../../../types/product.type';

interface ProductEcommerceTabProps {
    formData: Partial<Product>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<Product>>>;
    activeEcommerceSubTab: 'photos' | 'descriptions' | 'logistics';
    setActiveEcommerceSubTab: React.Dispatch<React.SetStateAction<'photos' | 'descriptions' | 'logistics'>>;
    isDraggingPhoto: boolean;
    setIsDraggingPhoto: React.Dispatch<React.SetStateAction<boolean>>;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => void;
    removingPhoto: string | null;
    removePhoto: (url: string) => void;
    handleGenerateAIDescription: (type: 'whatsapp' | 'ecommerce') => void;
    isGeneratingDescription: boolean;
}

const ProductEcommerceTab: React.FC<ProductEcommerceTabProps> = ({
    formData,
    setFormData,
    activeEcommerceSubTab,
    setActiveEcommerceSubTab,
    isDraggingPhoto,
    setIsDraggingPhoto,
    handleFileChange,
    removingPhoto,
    removePhoto,
    handleGenerateAIDescription,
    isGeneratingDescription
}) => {
    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Sub-tabs Navigation */}
            <div className="flex gap-4 p-1 bg-slate-100 dark:bg-slate-950/50 rounded-2xl self-start">
                {[
                    { id: 'photos', label: 'Fotos', icon: 'bi-images' },
                    { id: 'descriptions', label: 'Descrição / Canais', icon: 'bi-pencil-square' },
                    { id: 'logistics', label: 'Logística / Frete', icon: 'bi-truck' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveEcommerceSubTab(tab.id as any)}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeEcommerceSubTab === tab.id
                            ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                            }`}
                    >
                        <i className={`bi ${tab.icon}`}></i>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* PHOTOS SUB-TAB */}
            {activeEcommerceSubTab === 'photos' && (
                <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                    <div
                        onDragOver={(e) => { e.preventDefault(); setIsDraggingPhoto(true); }}
                        onDragLeave={() => setIsDraggingPhoto(false)}
                        onDrop={(e) => { e.preventDefault(); setIsDraggingPhoto(false); handleFileChange(e); }}
                        className={`relative group h-64 border-2 border-dashed rounded-[3rem] transition-all flex flex-col items-center justify-center gap-4 ${isDraggingPhoto ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-900/40 hover:bg-slate-50 dark:hover:bg-slate-950/40'}`}
                    >
                        <div className="p-5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-[2rem] shadow-lg shadow-blue-500/10 group-hover:scale-110 transition-transform">
                            <i className="bi bi-cloud-arrow-up text-4xl"></i>
                        </div>
                        <div className="text-center">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Arraste as fotos ou clique aqui</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">PNG, JPG ou WebP (Máx 2MB por arquivo)</p>
                        </div>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {formData.images?.map((url, idx) => (
                            <div key={url} className="relative group aspect-square rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-md animate-in zoom-in-95 duration-200">
                                <img src={url} alt={`Produto ${idx}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => removePhoto(url)}
                                        disabled={removingPhoto === url}
                                        className="p-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-500/40 scale-0 group-hover:scale-100 duration-300"
                                    >
                                        {removingPhoto === url ? <i className="bi bi-arrow-repeat animate-spin"></i> : <i className="bi bi-trash-fill"></i>}
                                    </button>
                                </div>
                                {idx === 0 && (
                                    <div className="absolute top-4 left-4 px-3 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                                        Principal
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* DESCRIPTIONS SUB-TAB */}
            {activeEcommerceSubTab === 'descriptions' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in duration-300">
                    {/* WhatsApp Marketplace */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                                <i className="bi bi-whatsapp"></i> Catálogo WhatsApp
                            </h5>
                            <button
                                type="button"
                                onClick={() => handleGenerateAIDescription('whatsapp')}
                                disabled={isGeneratingDescription}
                                className="text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg hover:bg-emerald-200"
                            >
                                <i className="bi bi-stars"></i> IA: Gerar Descrição
                            </button>
                        </div>
                        <textarea
                            value={formData.whatsappDescription || ''}
                            onChange={(e) => setFormData({ ...formData, whatsappDescription: e.target.value })}
                            className="w-full h-64 p-5 bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-[2rem] outline-none text-xs leading-relaxed font-bold custom-scrollbar"
                            placeholder="Descrição atraente para vendas rápidas no WhatsApp..."
                        />
                    </div>

                    {/* E-commerce Full */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                                <i className="bi bi-globe"></i> Loja Virtual / Site
                            </h5>
                            <button
                                type="button"
                                onClick={() => handleGenerateAIDescription('ecommerce')}
                                disabled={isGeneratingDescription}
                                className="text-[9px] font-black uppercase tracking-widest bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200"
                            >
                                <i className="bi bi-stars"></i> IA: Gerar Descrição
                            </button>
                        </div>
                        <textarea
                            value={formData.ecommerceDescription || ''}
                            onChange={(e) => setFormData({ ...formData, ecommerceDescription: e.target.value })}
                            className="w-full h-64 p-5 bg-blue-50/20 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 rounded-[2rem] outline-none text-xs leading-relaxed font-bold custom-scrollbar"
                            placeholder="Descrição completa com especificações técnicas e SEO..."
                        />
                    </div>
                </div>
            )}

            {/* LOGISTICS SUB-TAB */}
            {activeEcommerceSubTab === 'logistics' && (
                <div className="flex flex-col gap-8 animate-in fade-in duration-300">
                    <div className="bg-slate-50/50 dark:bg-slate-950/20 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col gap-6">
                        <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Dados de Envio / Logística</h4>
                            <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-1">Utilizado para cálculo de frete nos marketplaces</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Peso Bruto (KG)</label>
                                <input
                                    type="number"
                                    step="0.001"
                                    value={formData.weight || ''}
                                    onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-sm font-bold dark:text-slate-200"
                                    placeholder="0.000"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Largura Emb. (cm)</label>
                                <input
                                    type="number"
                                    value={formData.pkgWidth || ''}
                                    onChange={(e) => setFormData({ ...formData, pkgWidth: parseFloat(e.target.value) })}
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-sm font-bold dark:text-slate-200"
                                    placeholder="0"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Altura Emb. (cm)</label>
                                <input
                                    type="number"
                                    value={formData.pkgHeight || ''}
                                    onChange={(e) => setFormData({ ...formData, pkgHeight: parseFloat(e.target.value) })}
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-sm font-bold dark:text-slate-200"
                                    placeholder="0"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Profund. Emb. (cm)</label>
                                <input
                                    type="number"
                                    value={formData.pkgDepth || ''}
                                    onChange={(e) => setFormData({ ...formData, pkgDepth: parseFloat(e.target.value) })}
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-sm font-bold dark:text-slate-200"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductEcommerceTab;
